const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const officeRouter = require('./officeRouter');
const homeSliderRouter = require('./homeSliderRouter');
const contactsRouter = require('./contactsRouter');
const advantagesRouter = require('./advantagesRouter');
const settingsRoutes = require('./settingsRoutes');
const servicesRouter = require('./servicesRouter');
const workTypeRouter = require('./workTypeRouter');
const worksRouter = require('./worksRouter');
const reviewsRouter = require('./reviewsRouter');
const workScheduleRouter = require('./workScheduleRouter');


router.use('/user', userRouter);
router.use('/office', officeRouter);
router.use('/home-slider', homeSliderRouter);
router.use('/contact', contactsRouter);
router.use('/advantage', advantagesRouter);
router.use('/service', servicesRouter);
router.use('/main', settingsRoutes);
router.use('/work-type', workTypeRouter);
router.use('/work', worksRouter);
router.use('/review', reviewsRouter);
router.use('/work-schedule', workScheduleRouter);

module.exports = router;