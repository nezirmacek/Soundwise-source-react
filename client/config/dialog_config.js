/**
 * Created by developer on 12.06.17.
 */

const DIALOG_CONFIG = {
    lessonDisabled: {
        title: 'Can\'t listen to this lesson',
        message: 'This lesson is not available to you at the moment. ' +
            'In order to listen to this lesson please take a course. ' +
            'Do you want to take a course now?',
        actions: [
            {
                label: 'Take a course',
                primary: true,
                keyboardFocused: true,
            },
            {
                label: 'Not now',
                primary: false,
                keyboardFocused: false,
            },
        ],
    },
    buyCourseOfLesson: {
        title: 'This course isn\'t free',
        message: 'Do you want to buy this course?',
        actions: [
            {
                label: 'Buy',
                primary: true,
                keyboardFocused: true,
            },
            {
                label: 'Not now',
                primary: false,
                keyboardFocused: false,
            },
        ],
    },
};

export default DIALOG_CONFIG;
