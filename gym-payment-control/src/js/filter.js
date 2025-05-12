// src/js/filter.js

export function filterPayments(payments, paymentType, gender) {
    return payments.filter(payment => {
        const matchesPaymentType = paymentType ? payment.type === paymentType : true;
        const matchesGender = gender ? payment.gender === gender : true;
        return matchesPaymentType && matchesGender;
    });
}

export function updateDisplayedPayments(filteredPayments) {
    const paymentList = document.getElementById('payment-list');
    paymentList.innerHTML = '';

    filteredPayments.forEach(payment => {
        const listItem = document.createElement('li');
        listItem.textContent = `Date: ${payment.date}, Next Payment: ${payment.nextPaymentDate}, Remaining Days: ${payment.remainingDays}, Expired: ${payment.isExpired}, Overdue Days: ${payment.overdueDays}`;
        paymentList.appendChild(listItem);
    });
}

export function applyFilters() {
    const paymentType = document.getElementById('payment-type-filter').value;
    const gender = document.getElementById('gender-filter').value;

    // Assuming payments is an array of payment records available in the scope
    const filteredPayments = filterPayments(payments, paymentType, gender);
    updateDisplayedPayments(filteredPayments);
}