<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { listFiles, downloadFile, deleteFile, type EenFile, type EenError, type ListFilesParams, type FileIncludeField } from 'een-api-toolkit'

// Reactive state
const files = ref<EenFile[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const downloadingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const selectedFile = ref<EenFile | null>(null)

const hasNextPage = computed(() => !!nextPageToken.value)

// Request size and createTimestamp by default for better display
const defaultInclude: FileIncludeField[] = ['size', 'createTimestamp']

const params = ref<ListFilesParams>({
  pageSize: 20,
  include: defaultInclude,
  sort: ['-createTimestamp']
})

async function fetchFiles(fetchParams?: ListFilesParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await listFiles(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      files.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      files.value = [...files.value, ...result.data.results]
    } else {
      files.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchFiles()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchFiles({ ...params.value, pageToken: nextPageToken.value }, true)
}

async function handleDownload(file: EenFile) {
  downloadingId.value = file.id
  const result = await downloadFile(file.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Create download link
    const url = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.data.filename || file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  downloadingId.value = null
}

async function handleDelete(file: EenFile) {
  if (!confirm(`Are you sure you want to delete "${file.name}"? This will move it to the recycle bin.`)) {
    return
  }

  deletingId.value = file.id
  const result = await deleteFile(file.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Remove the file from the list
    files.value = files.value.filter(f => f.id !== file.id)
  }

  deletingId.value = null
}

function formatDate(timestamp: string | undefined) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

function getFileType(file: EenFile) {
  // Use type if available, otherwise derive from mimeType
  if (file.type) return file.type
  if (file.mimeType) {
    if (file.mimeType.startsWith('video/')) return 'video'
    if (file.mimeType.startsWith('image/')) return 'image'
    if (file.mimeType === 'application/directory') return 'folder'
    return file.mimeType.split('/')[1] || file.mimeType
  }
  return '-'
}

function formatSize(bytes: number | undefined) {
  if (bytes === undefined || bytes === null) return '-'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function openFileDetails(file: EenFile) {
  selectedFile.value = file
}

function closeModal() {
  selectedFile.value = null
}

onMounted(() => {
  fetchFiles()
})
</script>

<template>
  <div class="files">
    <div class="header">
      <h2>Files</h2>
      <button @click="refresh" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading && files.length === 0" class="loading">
      Loading files...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <table v-if="files.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in files" :key="file.id">
            <td><a href="#" class="file-link" @click.prevent="openFileDetails(file)">{{ file.name }}</a></td>
            <td>{{ getFileType(file) }}</td>
            <td>{{ formatSize(file.size) }}</td>
            <td>{{ formatDate(file.createTimestamp) }}</td>
            <td class="actions">
              <button
                class="btn-small"
                @click="handleDownload(file)"
                :disabled="downloadingId === file.id || deletingId === file.id"
              >
                {{ downloadingId === file.id ? 'Downloading...' : 'Download' }}
              </button>
              <button
                class="btn-small btn-danger"
                @click="handleDelete(file)"
                :disabled="downloadingId === file.id || deletingId === file.id"
              >
                {{ deletingId === file.id ? 'Deleting...' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>No files found.</p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- File Details Modal -->
    <div v-if="selectedFile" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>File Details</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">{{ selectedFile.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ selectedFile.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">{{ getFileType(selectedFile) }}</span>
          </div>
          <div v-if="selectedFile.mimeType" class="detail-row">
            <span class="detail-label">MIME Type:</span>
            <span class="detail-value">{{ selectedFile.mimeType }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Size:</span>
            <span class="detail-value">{{ formatSize(selectedFile.size) }}</span>
          </div>
          <div v-if="selectedFile.directory" class="detail-row">
            <span class="detail-label">Directory:</span>
            <span class="detail-value">{{ selectedFile.directory }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{ formatDate(selectedFile.createTimestamp) }}</span>
          </div>
          <div v-if="selectedFile.updateTimestamp" class="detail-row">
            <span class="detail-label">Updated:</span>
            <span class="detail-value">{{ formatDate(selectedFile.updateTimestamp) }}</span>
          </div>
          <div v-if="selectedFile.accountId" class="detail-row">
            <span class="detail-label">Account ID:</span>
            <span class="detail-value">{{ selectedFile.accountId }}</span>
          </div>
          <div v-if="selectedFile.tags && selectedFile.tags.length > 0" class="detail-row">
            <span class="detail-label">Tags:</span>
            <span class="detail-value">{{ selectedFile.tags.join(', ') }}</span>
          </div>
          <div v-if="selectedFile.notes" class="detail-row">
            <span class="detail-label">Notes:</span>
            <span class="detail-value">{{ selectedFile.notes }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="handleDownload(selectedFile)" :disabled="downloadingId === selectedFile.id">
            {{ downloadingId === selectedFile.id ? 'Downloading...' : 'Download' }}
          </button>
          <button class="btn-secondary" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.files {
  width: 80vw;
  min-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 0.85rem;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-danger:disabled {
  background-color: #f5b7b1;
  cursor: not-allowed;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.file-link {
  color: #42b883;
  text-decoration: none;
  cursor: pointer;
}

.file-link:hover {
  text-decoration: underline;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 70vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  width: 30%;
  flex-shrink: 0;
}

.detail-value {
  color: #666;
  word-break: break-all;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>
