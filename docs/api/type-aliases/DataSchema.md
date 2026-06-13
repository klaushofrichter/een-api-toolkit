[**EEN API Toolkit v0.3.107**](../README.md)

***

[EEN API Toolkit](../README.md) / DataSchema

# Type Alias: DataSchema

> **DataSchema** = `"een.objectDetection.v1"` \| `"een.objectClassification.v1"` \| `"een.objectRegionMapping.v1"` \| `"een.fullFrameImageUrl.v1"` \| `"een.croppedFrameImageUrl.v1"` \| `"een.fullFrameImageUrlWithOverlay.v1"` \| `"een.displayOverlay.boundingBox.v1"` \| `"een.bestImageUrl.v1"` \| `"een.personAttributes.v1"` \| `"een.vehicleAttributes.v1"` \| `"een.animalAttributes.v1"` \| `"een.weaponAttributes.v1"` \| `"een.geoLocation.v1"` \| `"een.entryDirection.v1"` \| `"een.trajectory.v1"` \| `"een.motionRegion.v1"` \| `"een.loiterArea.v1"` \| `"een.lineCrossLine.v1"` \| `"een.intrusionArea.v1"` \| `"een.monitoredArea.v1"` \| `"een.thermalMonitoredArea.v1"` \| `"een.countedLineCross.v1"` \| `"een.eevaAttributes.v1"` \| `"een.customLabels.v1"` \| `"een.humanValidationDetails.v1"` \| `"een.lprDetection.v1"` \| `"een.lprAccessType.v1"` \| `"een.userData.v1"` \| `"een.userTags.v1"` \| `"een.vehicleListInfo.v1"` \| `"een.vspInsightsSummary.v1"` \| `"een.vspVisitDetails.v1"` \| `"een.dotNumberRecognition.v1"` \| `"een.truckNumberRecognition.v1"` \| `"een.trailerNumberRecognition.v1"` \| `"een.recognizedText.v1"` \| `"een.audioDetection.v1"` \| `"een.posTransactionStart.v1"` \| `"een.posTransactionEnd.v1"` \| `"een.posTransactionItem.v1"` \| `"een.posTransactionPayment.v1"` \| `"een.posTransactionCartChangeTrail.v1"` \| `"een.posTransactionCardLoadSummary.v1"` \| `"een.posTransactionFlag.v1"` \| `"een.posTransactionLabel.v1"` \| `"een.rawData.v1"` \| `"een.displayLocationSummary.v1"` \| `"een.credentialAccessActivation.v1"` \| `"een.userAccessActivation.v1"` \| `"een.deviceCloudStatusUpdate.v1"` \| `"een.deviceStatusUpdate.v1"` \| `"een.deviceCloudPreviousStatus.v1"` \| `"een.deviceCloudConnectionStatusUpdate.v1"` \| `"een.deviceCloudConnectionPreviousStatus.v1"` \| `"een.deviceCommonStatusUpdate.v1"` \| `"een.deviceErrorStatusUpdate.v1"` \| `"een.deviceIO.v1"` \| `"een.deviceOperationDetails.v1"` \| `"een.deviceOperationSubStep.v1"` \| `"een.deviceOperationUpdate.v1"` \| `"een.ptzPositionUpdate.v1"` \| `"een.measurementStringValueUpdate.v1"` \| `"een.batteryLevelUpdate.v1"` \| `"een.measurementThresholdStatus.v1"` \| `"een.measurementValueUpdate.v1"` \| `"een.thermalCameraValueUpdate.v1"` \| `"een.countData.v1"` \| `"een.creatorDetails.v1"` \| `"een.resourceDetails.v1"` \| `"een.alertConditionRuleInfo.v1"` \| `"een.alertInfo.v1"` \| `"een.gunDetectionAlertInfo.v1"` \| `"een.lprRuleCountAggrAlertInfo.v1"` \| `"een.lprRuleWatchAlertInfo.v1"` \| `"een.smartAlertObjectCountAlertInfo.v1"` \| `"een.jobDetails.v1"` \| `"een.ownerDetails.v1"`

Defined in: [events/dataSchemas.ts:50](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L50)

Data schema identifier used in the EEN API.

## Remarks

These are the schema names as they appear in the event's `dataSchemas` array.
When using in the `include` parameter, prefix with `data.`.

Not all schemas are mapped to specific event types in `EVENT_TYPE_DATA_SCHEMAS`.
Unmapped schemas (e.g., alert-related, counting, trajectory) may still appear in
API responses as part of an event's `data` array.
