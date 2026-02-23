import { describe, it, expect } from 'vitest'
import type {
  Camera,
  CameraStatus,
  CameraDeviceInfo,
  CameraShareDetails,
  CameraStreamUrls,
  CameraRtspConnectionSettings,
  CameraDevicePosition,
  CameraRecordingModes,
  ListCamerasParams,
  GetCameraParams,
  CameraSettings,
  CameraSettingsRetention,
  CameraSettingsAudio,
  CameraSettingsPreviewVideo,
  CameraSettingsMainVideo,
  CameraSettingsAnalog,
  CameraSettingsOperating,
  GetCameraSettingsParams
} from '../types'

describe('Camera types', () => {
  describe('Camera interface', () => {
    it('should accept a minimal camera object', () => {
      const camera: Camera = {
        id: 'cam-123',
        name: 'Front Door',
        accountId: 'acc-456'
      }

      expect(camera.id).toBe('cam-123')
      expect(camera.name).toBe('Front Door')
      expect(camera.accountId).toBe('acc-456')
    })

    it('should accept a full camera object with all optional fields', () => {
      const camera: Camera = {
        id: 'cam-123',
        name: 'Front Door',
        accountId: 'acc-456',
        bridgeId: 'bridge-789',
        locationId: 'loc-001',
        guid: 'guid-xyz',
        macAddress: '00:11:22:33:44:55',
        ipAddress: '192.168.1.100',
        timezone: 'America/Los_Angeles',
        status: 'online',
        tags: ['entrance', 'security'],
        packages: ['analytics'],
        multiCameraId: null,
        speakerId: null,
        deviceInfo: {
          make: 'Axis',
          model: 'P1375',
          firmwareVersion: '10.12.0',
          directToCloud: false,
          serialNumber: 'SN123456',
          resolution: '1080p',
          type: 'IP'
        },
        shareDetails: {
          shared: false,
          accountId: 'acc-share',
          firstResponder: false,
          permissions: ['view', 'ptz']
        },
        streamUrls: {
          hls: 'https://example.com/hls',
          rtsp: 'rtsp://example.com/stream',
          webrtc: 'https://example.com/webrtc',
          jpeg: 'https://example.com/snapshot.jpg'
        },
        rtspConnectionSettings: {
          url: 'rtsp://camera.local/stream',
          username: 'admin',
          transport: 'tcp'
        },
        devicePosition: {
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 10,
          floor: 1,
          azimuth: 180
        },
        enabledAnalytics: ['motion', 'lineCrossing'],
        recordingModes: {
          continuous: true,
          motion: true,
          scheduled: false
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-06-20T14:45:00Z'
      }

      expect(camera.id).toBe('cam-123')
      expect(camera.deviceInfo?.make).toBe('Axis')
      expect(camera.status).toBe('online')
      expect(camera.tags).toContain('entrance')
      expect(camera.streamUrls?.hls).toBe('https://example.com/hls')
      expect(camera.devicePosition?.latitude).toBe(37.7749)
      expect(camera.recordingModes?.continuous).toBe(true)
    })

    it('should accept PTZ capability fields including fisheye', () => {
      const ptzCamera: Camera = {
        id: 'cam-ptz',
        name: 'PTZ Camera',
        accountId: 'acc-456',
        capabilities: {
          ptz: {
            capable: true,
            fisheye: false,
            panTilt: true,
            zoom: true,
            positionMove: true,
            directionMove: true,
            centerOnMove: true
          }
        }
      }

      expect(ptzCamera.capabilities?.ptz?.capable).toBe(true)
      expect(ptzCamera.capabilities?.ptz?.fisheye).toBe(false)
      expect(ptzCamera.capabilities?.ptz?.panTilt).toBe(true)
      expect(ptzCamera.capabilities?.ptz?.zoom).toBe(true)
      expect(ptzCamera.capabilities?.ptz?.positionMove).toBe(true)
      expect(ptzCamera.capabilities?.ptz?.directionMove).toBe(true)
      expect(ptzCamera.capabilities?.ptz?.centerOnMove).toBe(true)
    })

    it('should identify fisheye cameras as non-PTZ', () => {
      const fisheyeCamera: Camera = {
        id: 'cam-fisheye',
        name: 'Fisheye Camera',
        accountId: 'acc-456',
        capabilities: {
          ptz: {
            capable: true,
            fisheye: true
          }
        }
      }

      const ptz = fisheyeCamera.capabilities?.ptz
      const isPtzCapable = ptz?.capable === true && ptz?.fisheye !== true

      expect(ptz?.capable).toBe(true)
      expect(ptz?.fisheye).toBe(true)
      expect(isPtzCapable).toBe(false)
    })

    it('should treat missing fisheye field as non-fisheye', () => {
      const camera: Camera = {
        id: 'cam-ptz',
        name: 'PTZ Camera',
        accountId: 'acc-456',
        capabilities: { ptz: { capable: true } }
      }

      const ptz = camera.capabilities?.ptz
      const isPtzCapable = ptz?.capable === true && ptz?.fisheye !== true

      expect(ptz?.fisheye).toBeUndefined()
      expect(isPtzCapable).toBe(true)
    })

    it('should accept null for bridgeId and locationId', () => {
      const camera: Camera = {
        id: 'cam-direct',
        name: 'Direct Cloud Camera',
        accountId: 'acc-456',
        bridgeId: null,
        locationId: null
      }

      expect(camera.bridgeId).toBeNull()
      expect(camera.locationId).toBeNull()
    })
  })

  describe('CameraStatus type', () => {
    it('should accept all valid status values', () => {
      const statuses: CameraStatus[] = [
        'online',
        'offline',
        'deviceOffline',
        'bridgeOffline',
        'invalidCredentials',
        'error',
        'streaming',
        'registered',
        'attaching',
        'initializing'
      ]

      expect(statuses).toHaveLength(10)
      expect(statuses).toContain('online')
      expect(statuses).toContain('offline')
      expect(statuses).toContain('streaming')
    })
  })

  describe('CameraDeviceInfo interface', () => {
    it('should accept device info with all fields', () => {
      const deviceInfo: CameraDeviceInfo = {
        make: 'Hikvision',
        model: 'DS-2CD2143G2-I',
        firmwareVersion: '5.7.1',
        directToCloud: true,
        serialNumber: 'HV123456789',
        resolution: '4MP',
        type: 'IP'
      }

      expect(deviceInfo.make).toBe('Hikvision')
      expect(deviceInfo.directToCloud).toBe(true)
    })
  })

  describe('CameraShareDetails interface', () => {
    it('should accept share details', () => {
      const shareDetails: CameraShareDetails = {
        shared: true,
        accountId: 'acc-shared',
        firstResponder: true,
        permissions: ['view', 'ptz', 'audio']
      }

      expect(shareDetails.shared).toBe(true)
      expect(shareDetails.permissions).toContain('ptz')
    })
  })

  describe('CameraStreamUrls interface', () => {
    it('should accept stream URLs', () => {
      const streamUrls: CameraStreamUrls = {
        hls: 'https://stream.example.com/cam/hls',
        rtsp: 'rtsp://stream.example.com/cam',
        webrtc: 'https://webrtc.example.com/cam',
        jpeg: 'https://stream.example.com/cam/snapshot.jpg'
      }

      expect(streamUrls.hls).toContain('hls')
      expect(streamUrls.rtsp).toContain('rtsp://')
    })
  })

  describe('CameraRtspConnectionSettings interface', () => {
    it('should accept RTSP settings', () => {
      const rtspSettings: CameraRtspConnectionSettings = {
        url: 'rtsp://192.168.1.100:554/stream1',
        username: 'admin',
        transport: 'tcp'
      }

      expect(rtspSettings.url).toContain('rtsp://')
      expect(rtspSettings.transport).toBe('tcp')
    })

    it('should accept udp transport', () => {
      const rtspSettings: CameraRtspConnectionSettings = {
        url: 'rtsp://camera/stream',
        transport: 'udp'
      }

      expect(rtspSettings.transport).toBe('udp')
    })
  })

  describe('CameraDevicePosition interface', () => {
    it('should accept position data', () => {
      const position: CameraDevicePosition = {
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 50,
        floor: 3,
        azimuth: 270
      }

      expect(position.latitude).toBe(40.7128)
      expect(position.floor).toBe(3)
    })
  })

  describe('CameraRecordingModes interface', () => {
    it('should accept recording modes', () => {
      const modes: CameraRecordingModes = {
        continuous: true,
        motion: true,
        scheduled: false
      }

      expect(modes.continuous).toBe(true)
      expect(modes.scheduled).toBe(false)
    })
  })

  describe('ListCamerasParams interface', () => {
    it('should accept pagination parameters', () => {
      const params: ListCamerasParams = {
        pageSize: 50,
        pageToken: 'abc123'
      }

      expect(params.pageSize).toBe(50)
      expect(params.pageToken).toBe('abc123')
    })

    it('should accept include and sort parameters', () => {
      const params: ListCamerasParams = {
        include: ['deviceInfo', 'streamUrls', 'shareDetails'],
        sort: ['-createdAt', 'name']
      }

      expect(params.include).toContain('deviceInfo')
      expect(params.sort).toContain('-createdAt')
    })

    it('should accept location and bridge filters', () => {
      const params: ListCamerasParams = {
        locationId__in: ['loc-1', 'loc-2'],
        bridgeId__in: ['bridge-1', 'bridge-2']
      }

      expect(params.locationId__in).toHaveLength(2)
      expect(params.bridgeId__in).toContain('bridge-1')
    })

    it('should accept multi-camera filters', () => {
      const params: ListCamerasParams = {
        multiCameraId: 'multi-123',
        multiCameraId__ne: 'multi-456',
        multiCameraId__in: ['multi-1', 'multi-2']
      }

      expect(params.multiCameraId).toBe('multi-123')
      expect(params.multiCameraId__ne).toBe('multi-456')
    })

    it('should accept tag and package filters', () => {
      const params: ListCamerasParams = {
        tags__contains: ['security', 'entrance'],
        tags__any: ['outdoor', 'indoor'],
        packages__contains: ['analytics']
      }

      expect(params.tags__contains).toContain('security')
      expect(params.tags__any).toContain('outdoor')
    })

    it('should accept name filters', () => {
      const params: ListCamerasParams = {
        name: 'Front Door',
        name__contains: 'door',
        name__in: ['Front Door', 'Back Door']
      }

      expect(params.name).toBe('Front Door')
      expect(params.name__contains).toBe('door')
    })

    it('should accept ID filters', () => {
      const params: ListCamerasParams = {
        id__in: ['cam-1', 'cam-2'],
        id__notIn: ['cam-3'],
        id__contains: 'cam-'
      }

      expect(params.id__in).toHaveLength(2)
      expect(params.id__notIn).toContain('cam-3')
    })

    it('should accept share detail filters', () => {
      const params: ListCamerasParams = {
        shared: true,
        sharedCameraAccount: 'acc-123',
        firstResponder: false
      }

      expect(params.shared).toBe(true)
      expect(params.firstResponder).toBe(false)
    })

    it('should accept device filters', () => {
      const params: ListCamerasParams = {
        directToCloud: true
      }

      expect(params.directToCloud).toBe(true)
    })

    it('should accept search parameters', () => {
      const params: ListCamerasParams = {
        q: 'front door camera',
        qRelevance__gte: 0.5
      }

      expect(params.q).toBe('front door camera')
      expect(params.qRelevance__gte).toBe(0.5)
    })

    it('should accept analytics filter', () => {
      const params: ListCamerasParams = {
        enabledAnalytics__contains: ['motion', 'lineCrossing']
      }

      expect(params.enabledAnalytics__contains).toContain('motion')
    })

    it('should accept status filters', () => {
      const params: ListCamerasParams = {
        status__in: ['online', 'streaming'],
        status__ne: 'offline'
      }

      expect(params.status__in).toContain('online')
      expect(params.status__ne).toBe('offline')
    })

    it('should accept all filter parameters together', () => {
      const params: ListCamerasParams = {
        pageSize: 100,
        pageToken: 'token123',
        include: ['deviceInfo'],
        sort: ['name'],
        locationId__in: ['loc-1'],
        bridgeId__in: ['bridge-1'],
        status__in: ['online'],
        tags__contains: ['security'],
        q: 'search term',
        directToCloud: false,
        shared: false
      }

      expect(params.pageSize).toBe(100)
      expect(params.status__in).toContain('online')
      expect(params.directToCloud).toBe(false)
    })
  })

  describe('GetCameraParams interface', () => {
    it('should accept include parameter', () => {
      const params: GetCameraParams = {
        include: ['deviceInfo', 'streamUrls', 'shareDetails']
      }

      expect(params.include).toContain('deviceInfo')
      expect(params.include).toHaveLength(3)
    })

    it('should accept empty params', () => {
      const params: GetCameraParams = {}

      expect(params.include).toBeUndefined()
    })
  })

  describe('CameraSettings types', () => {
    it('should accept a minimal CameraSettings object', () => {
      const settings: CameraSettings = {
        data: {}
      }

      expect(settings.data).toBeDefined()
      expect(settings.schema).toBeUndefined()
      expect(settings.proposedValues).toBeUndefined()
    })

    it('should accept a full CameraSettings with all nested data', () => {
      const settings: CameraSettings = {
        data: {
          timeZone: 'America/Los_Angeles',
          rtsp: {
            url: 'rtsp://camera.local/stream',
            username: 'admin',
            transport: 'tcp'
          },
          credentials: {
            username: 'admin',
            password: 'secret'
          },
          retention: {
            cloudDays: 30,
            cloudPreviewOnly: false,
            minimumOnPremiseDays: 7,
            maximumOnPremiseDays: 90,
            alwaysRecordingDays: 3
          },
          audio: {
            microphoneEnabled: true,
            inputSourceId: 'mic-1'
          },
          previewVideo: {
            transmitMode: 'always',
            resolution: 'CIF',
            intervalMs: 4000,
            quality: 'medium',
            supportedResolutions: ['CIF', 'QCIF', '4CIF']
          },
          mainVideo: {
            transmitMode: 'always',
            resolution: '1080p',
            quality: 'high',
            kbpsFactor: 1.0,
            captureMode: 'stream',
            supportedResolutions: ['720p', '1080p', '4K']
          },
          analog: {
            videoStandard: 'NTSC',
            badSignalProtection: true,
            badSignalDetected: false
          },
          operatingSettings: {
            on: true,
            scheduledOverride: {
              on: false,
              schedule: '0 22 * * *'
            }
          },
          talkdown: {
            protocol: 'SIP',
            audioMode: 'simplex',
            sipCredentials: { user: 'sip-user' }
          }
        }
      }

      expect(settings.data.timeZone).toBe('America/Los_Angeles')
      expect(settings.data.retention?.cloudDays).toBe(30)
      expect(settings.data.previewVideo?.supportedResolutions).toContain('CIF')
      expect(settings.data.mainVideo?.kbpsFactor).toBe(1.0)
      expect(settings.data.operatingSettings?.on).toBe(true)
    })

    it('should accept CameraSettings with schema and proposedValues', () => {
      const settings: CameraSettings = {
        data: {
          timeZone: 'UTC',
          retention: { cloudDays: 14 }
        },
        schema: {
          type: 'object',
          properties: {
            timeZone: { type: 'string' }
          }
        },
        proposedValues: {
          retention: { cloudDays: 30 }
        }
      }

      expect(settings.schema).toBeDefined()
      expect(settings.proposedValues).toBeDefined()
    })
  })

  describe('CameraSettingsRetention interface', () => {
    it('should accept retention settings', () => {
      const retention: CameraSettingsRetention = {
        cloudDays: 30,
        cloudPreviewOnly: false,
        minimumOnPremiseDays: 7,
        maximumOnPremiseDays: 90,
        alwaysRecordingDays: 3
      }

      expect(retention.cloudDays).toBe(30)
      expect(retention.cloudPreviewOnly).toBe(false)
      expect(retention.maximumOnPremiseDays).toBe(90)
    })
  })

  describe('CameraSettingsPreviewVideo interface', () => {
    it('should accept preview video settings with supportedResolutions', () => {
      const preview: CameraSettingsPreviewVideo = {
        transmitMode: 'always',
        resolution: 'CIF',
        intervalMs: 4000,
        quality: 'medium',
        supportedResolutions: ['CIF', 'QCIF']
      }

      expect(preview.resolution).toBe('CIF')
      expect(preview.supportedResolutions).toHaveLength(2)
    })
  })

  describe('CameraSettingsMainVideo interface', () => {
    it('should accept main video settings with supportedResolutions', () => {
      const main: CameraSettingsMainVideo = {
        transmitMode: 'always',
        resolution: '1080p',
        quality: 'high',
        kbpsFactor: 1.5,
        captureMode: 'stream',
        supportedResolutions: ['720p', '1080p']
      }

      expect(main.kbpsFactor).toBe(1.5)
      expect(main.supportedResolutions).toContain('1080p')
    })
  })

  describe('CameraSettingsAudio interface', () => {
    it('should accept audio settings', () => {
      const audio: CameraSettingsAudio = {
        microphoneEnabled: true,
        inputSourceId: 'mic-0'
      }

      expect(audio.microphoneEnabled).toBe(true)
      expect(audio.inputSourceId).toBe('mic-0')
    })
  })

  describe('CameraSettingsAnalog interface', () => {
    it('should accept analog settings', () => {
      const analog: CameraSettingsAnalog = {
        videoStandard: 'PAL',
        badSignalProtection: true,
        badSignalDetected: false
      }

      expect(analog.videoStandard).toBe('PAL')
      expect(analog.badSignalProtection).toBe(true)
    })
  })

  describe('CameraSettingsOperating interface', () => {
    it('should accept operating settings with scheduledOverride', () => {
      const operating: CameraSettingsOperating = {
        on: true,
        scheduledOverride: {
          on: true,
          schedule: '0 8-18 * * 1-5'
        }
      }

      expect(operating.on).toBe(true)
      expect(operating.scheduledOverride?.on).toBe(true)
      expect(operating.scheduledOverride?.schedule).toBe('0 8-18 * * 1-5')
    })

    it('should accept operating settings with null scheduledOverride', () => {
      const operating: CameraSettingsOperating = {
        on: true,
        scheduledOverride: null
      }

      expect(operating.scheduledOverride).toBeNull()
    })
  })

  describe('GetCameraSettingsParams interface', () => {
    it('should accept include with schema', () => {
      const params: GetCameraSettingsParams = {
        include: ['schema']
      }

      expect(params.include).toContain('schema')
    })

    it('should accept include with proposedValues', () => {
      const params: GetCameraSettingsParams = {
        include: ['proposedValues']
      }

      expect(params.include).toContain('proposedValues')
    })

    it('should accept include with both schema and proposedValues', () => {
      const params: GetCameraSettingsParams = {
        include: ['schema', 'proposedValues']
      }

      expect(params.include).toHaveLength(2)
    })

    it('should accept empty params', () => {
      const params: GetCameraSettingsParams = {}

      expect(params.include).toBeUndefined()
    })
  })
})
