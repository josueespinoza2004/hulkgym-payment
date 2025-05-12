// notifications.js

export function checkExpiredServices(payments) {
    const currentDate = new Date();
    const notifications = [];

    payments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const nextPaymentDate = new Date(payment.nextPaymentDate);
        const remainingDays = Math.ceil((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24));
        const overdueDays = remainingDays < 0 ? Math.abs(remainingDays) : 0;

        if (overdueDays > 0) {
            notifications.push({
                clientId: payment.clientId,
                message: `Service expired for client ${payment.clientId}. Overdue by ${overdueDays} days.`,
                overdueDays: overdueDays
            });
        }
    });

    return notifications;
}

export function displayNotifications(notifications) {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.innerHTML = '';

    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'alert alert-warning';
        notificationElement.textContent = notification.message;
        notificationContainer.appendChild(notificationElement);
    });
}