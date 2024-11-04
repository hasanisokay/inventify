import toast from "react-hot-toast"

const markAsPaid = async (order) => {
    const formData = {
        invoiceNumber: order.invoiceNumber,
        newPaidAmount: order.total,
        newDueAmount: order.newDueAmount || 0,
        paymentFromNumber: order.paymentFromNumber || "",
        trxId: order.trxId || "",
        paymentMethod: order.paymentMethod === "not-paid" ? "" : (order.paymentMethod || "")
    }
    const res = await fetch('/api/updates/mark-invoice-as-paid', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    const data = await res.json()
    if (data.status === 200) {
        toast.success(data.message)
    } else {
        toast.error(data.message)
    }
}
export default markAsPaid;