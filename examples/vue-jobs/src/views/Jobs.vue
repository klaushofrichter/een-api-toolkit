<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { listJobs, getCurrentUser, deleteJob, type Job, type EenError, type ListJobsParams, type JobState } from 'een-api-toolkit'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive state
const jobs = ref<Job[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const currentUserId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const hasNextPage = computed(() => !!nextPageToken.value)

// Filter state
const selectedStates = ref<JobState[]>([])
const stateOptions: { value: JobState; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'started', label: 'Started' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'revoked', label: 'Revoked' }
]

const params = ref<ListJobsParams>({ pageSize: 20 })

async function fetchJobs(fetchParams?: ListJobsParams, append = false) {
  loading.value = true
  error.value = null

  // Get current user ID if not already fetched
  if (!currentUserId.value) {
    const userResult = await getCurrentUser()
    if (userResult.error) {
      error.value = userResult.error
      loading.value = false
      return { error: userResult.error, data: null }
    }
    currentUserId.value = userResult.data.id
  }

  const mergedParams: ListJobsParams = { ...params.value, ...fetchParams, userId: currentUserId.value }

  // Add state filter if selected
  if (selectedStates.value.length > 0) {
    mergedParams.state__in = selectedStates.value
  }

  const result = await listJobs(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      jobs.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      jobs.value = [...jobs.value, ...result.data.results]
    } else {
      jobs.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchJobs()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchJobs({ ...params.value, pageToken: nextPageToken.value }, true)
}

function viewJob(jobId: string) {
  router.push(`/jobs/${jobId}`)
}

async function handleDelete(job: Job) {
  const jobName = getJobName(job)
  if (!confirm(`Are you sure you want to delete job "${jobName}"?`)) {
    return
  }

  deletingId.value = job.id
  const result = await deleteJob(job.id)

  if (result.error) {
    error.value = result.error
  } else {
    // Remove the job from the list
    jobs.value = jobs.value.filter(j => j.id !== job.id)
  }

  deletingId.value = null
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

function getStateBadgeClass(state: JobState) {
  return `badge badge-${state}`
}

function getJobName(job: Job) {
  return job.arguments?.originalRequest?.name || job.id
}

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="jobs">
    <div class="header">
      <h2>Jobs</h2>
      <button @click="refresh" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div class="filters">
      <label>Filter by state:</label>
      <div class="state-checkboxes">
        <label v-for="option in stateOptions" :key="option.value" class="checkbox-label">
          <input
            type="checkbox"
            :value="option.value"
            v-model="selectedStates"
            @change="refresh"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div v-if="loading && jobs.length === 0" class="loading">
      Loading jobs...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <table v-if="jobs.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>State</th>
            <th>Progress</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in jobs" :key="job.id">
            <td>{{ getJobName(job) }}</td>
            <td>{{ job.type }}</td>
            <td>
              <span :class="getStateBadgeClass(job.state)">
                {{ job.state }}
              </span>
            </td>
            <td>
              <span v-if="job.state === 'started'">{{ Math.round((job.progress || 0) * 100) }}%</span>
              <span v-else-if="job.state === 'success'">Complete</span>
              <span v-else-if="job.state === 'failure'" class="error-text">Failed</span>
              <span v-else>-</span>
            </td>
            <td>{{ formatDate(job.createTimestamp) }}</td>
            <td class="actions">
              <button class="btn-small" @click="viewJob(job.id)" :disabled="deletingId === job.id">View</button>
              <button
                class="btn-small btn-danger"
                @click="handleDelete(job)"
                :disabled="deletingId === job.id"
              >
                {{ deletingId === job.id ? 'Deleting...' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>No jobs found.</p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jobs {
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

.filters {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.filters label {
  font-weight: 500;
  margin-right: 10px;
}

.state-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
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

.error-text {
  color: #e74c3c;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
