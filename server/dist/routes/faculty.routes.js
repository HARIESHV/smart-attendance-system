"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faculty_controller_1 = require("../controllers/faculty.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('faculty'));
router.get('/profile', faculty_controller_1.getFacultyProfile);
router.get('/analytics', faculty_controller_1.getFacultyAnalytics);
router.post('/classes', faculty_controller_1.createClass);
router.get('/classes', faculty_controller_1.getFacultyClasses);
router.put('/classes/:id', faculty_controller_1.updateClass);
router.delete('/classes/:id', faculty_controller_1.deleteClass);
router.get('/classes/:id/students', faculty_controller_1.getClassStudents);
router.post('/classes/:id/students', faculty_controller_1.addStudentsToClass);
router.delete('/classes/:id/students/:studentId', faculty_controller_1.removeStudentFromClass);
exports.default = router;
//# sourceMappingURL=faculty.routes.js.map