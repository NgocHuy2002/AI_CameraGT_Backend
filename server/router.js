import express from 'express';

import userRouter from './api/resources/User/user.router';
import refreshTokenRouter from './api/resources/RefreshToken/refreshToken.router';
import { roleRouter } from './api/resources/Role/role.router';

import { caiDatHeThongRouter } from './api/resources/CaiDatHeThong/caiDatHeThong.router';
import { notificationRouter } from './api/resources/Notification/notification.router';
import { fileRouter } from './api/resources/File/file.router';

import { eventsRouter } from './api/resources/UserTrackings/Events/events.router';
import { visitsRouter } from './api/resources/UserTrackings/Visits/visits.router';
import { cameraRouter } from './api/resources/Camera/camera.router';
import { cameraTypeRouter } from './api/resources/CameraType/cameraType.router';
import { unitRouter } from './api/resources/Unit/unit.router';
import { positionRouter } from './api/resources/Position/position.router';
import { warningRouter } from './api/resources/Warning/warning.router';
import { dashboardRouter } from './api/resources/Dashboard/dashboard.router';
import { mapsCameraRouter } from './api/resources/MapsCamera/mapsCamera.router';
import { wardRouter } from './api/resources/Ward/ward.router';
import { phuongTienRouter } from './api/resources/VehicleList/vehicle.router'
import { ownerRouter } from './api/resources/Owner/owner.router'
import { blackListRouter } from './api/resources/BlackList/blackList.router'
import { rtspRouter } from './api/resources/RTSP/rtsp.router';

const router = express.Router();

router.use('/caidathethong', caiDatHeThongRouter);
router.use('/users', userRouter);
router.use('/refreshToken', refreshTokenRouter);
router.use('/role', roleRouter);

router.use('/notification', notificationRouter);
router.use('/file', fileRouter);

/*Start User Tracking System*/
router.use('/events', eventsRouter);
router.use('/visits', visitsRouter);
/*End User Tracking System*/

router.use('/camera', cameraRouter);
router.use('/camera-type', cameraTypeRouter);
router.use('/unit', unitRouter);
router.use('/position', positionRouter);
router.use('/warning', warningRouter);
router.use('/dashboard', dashboardRouter);
router.use('/maps-camera', mapsCameraRouter);
router.use('/vehicle-list', phuongTienRouter);
router.use('/ward', wardRouter);
router.use('/owner', ownerRouter);
router.use('/black-list', blackListRouter);
router.use('/rtsp', rtspRouter);
module.exports = router;
