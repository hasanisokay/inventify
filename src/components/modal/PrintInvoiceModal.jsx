/* eslint-disable @next/next/no-img-element */
'use client';
import formatDate from '@/utils/formatDate.mjs';
import React, { useState } from 'react';
import generatePDF from 'react-to-pdf';
const PrintInvoiceModal = ({ resetStates, openModal, setOpenModal, invoiceNumber, invoiceDate, customerInfo, orgInfo, items, subtotal, totalTax, shippingCharge, discount, paidAmount, total, note, currency = "BDT" }) => {
    const [selectedPreview, setSelectedPreview] = useState('Invoice');

    const handlePreview = (type) => {
        setSelectedPreview(type);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-area');
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`<html><head><title>${invoiceNumber}</title>`);

        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
        // printWindow.document.write('<link href="./tailwind.min.css" rel="stylesheet">');
        // printWindow.document.write('<link href="./../../../public/css/tailwind.min.css" rel="stylesheet">');
        // printWindow.document.write('<link href="/public/css/tailwind.min.css" rel="stylesheet">');
        printWindow.document.write('<link href="./../../app/globals.css" rel="stylesheet">');

        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const pdfOptions = {
        filename: `${invoiceNumber}.pdf`,
        method: "save",

        page: {
            margin: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10,
            },
            format: "A4",
            orientation: "portrait",
        },
        canvas: {
            mimeType: "image/jpeg",
            qualityRatio: 1,
        },
        overrides: {
            pdf: {
                compress: true,
            },
            canvas: {
                useCORS: true,
            },
        },
    };

    const handleSavePDF = () => {

        generatePDF(() => document.getElementById("printable-area"), pdfOptions);

    };

    const getFullAddress = (a) => {
        const parts = [
            a?.street,
            a?.city,
            a?.state,
            a?.postalCode,
            a?.country
        ].filter(Boolean);
        return parts.join(', ');
    }
    const renderPreview = () => {
        if (!selectedPreview) return null;
        const orgInformation = <>
            <div className="flex items-start flex-col mb-4">
                <div>
                    <img src={orgInfo?.logoUrl} alt="Organization Logo" style={{ height: '90px', width: '100px' }} />
                </div>
                <div className='space-y-2'>
                    <h1 className="text-xl font-semibold">{orgInfo?.name}</h1>
                    <p className="text-sm text-gray-500 w-[200px] whitespace-break-spaces">{getFullAddress(orgInfo?.address)}</p>
                    {selectedPreview === 'Invoice' && <p className='text-sm text-gray-500'>{orgInfo?.phone}</p>}
                    {selectedPreview === 'Invoice' && <p className='text-sm text-gray-500'>{orgInfo?.email}</p>}
                    {selectedPreview === 'Invoice' && <p className='text-sm text-gray-500'>{orgInfo?.website}</p>}

                </div>
            </div>
        </>

        const thStyle = {
            borderBottom: '2px solid #cbd5e1',
            padding: '0.5rem',
            textAlign: 'left',
            fontWeight: '600'
        }
        const tdStyle = {
            borderBottom: '1px solid #e2e8f0',
            padding: '0.5rem',
        }
        const pStyle = {
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #e2e8f0'
        }
        const tableStyle = {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            fontFamily: 'Arial, sans-serif',
            fontSize: '0.875rem',
            color: '#4a5568'
        }
        const spanStyle = { width: '120px', textAlign: 'left' }
        return (
            <div className="p-4 bg-white">
                {selectedPreview === 'Invoice' && (
                    <>
                        <div className='flex justify-between'>
                            {
                                orgInformation
                            }
                            <div className='flex flex-col justify-around'>
                                <div>
                                    <h3 className="text-2xl font-medium leading-6 mb-2">INVOICE</h3>
                                    <p className='text-gray-500 mb-1 text-sm font-medium'>#{invoiceNumber}</p>
                                    <p className="text-sm">Date: {formatDate(invoiceDate)}</p>
                                </div>
                                <div className='space-y-2 text-sm'>
                                    <h4 className="">Bill To:</h4>
                                    <p className=' max-w-[200px] whitespace-break-spaces font-semibold'>{`${customerInfo?.firstName || "Another"} ${customerInfo?.lastName || "Customer"}`}</p>
                                    <p className='w-[200px]'>{customerInfo?.billingAddress || ""}</p>
                                    <p>{customerInfo?.phone || ""}</p>
                                </div>
                            </div>
                        </div>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{
                                    backgroundColor: '#f3f4f6'
                                }}>
                                    <th style={thStyle}>Item</th>
                                    <th style={thStyle}>Quantity</th>
                                    <th style={thStyle}>Unit Price</th>
                                    <th style={thStyle}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} style={{
                                        transition: 'background-color 0.15s ease-in-out'
                                    }}>
                                        <td style={tdStyle}>{item?.name}</td>
                                        <td style={tdStyle}>{item?.quantity}</td>
                                        <td style={tdStyle}>{item?.sellingPrice}</td>
                                        <td style={tdStyle}>{item?.quantity * item?.sellingPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{
                            marginTop: '1rem',
                            textAlign: 'right',
                            fontSize: '0.875rem',
                            fontFamily: 'Arial, sans-serif',
                            color: '#4a5568'
                        }}>
                            <p style={pStyle}>
                                <span style={spanStyle}>Subtotal:</span>
                                <span>{subtotal.toFixed(2)}</span>
                            </p>
                            {totalTax > 0 && (
                                <p style={pStyle}>
                                    <span style={spanStyle}>Total Tax:</span>
                                    <span>{totalTax.toFixed(2)}</span>
                                </p>
                            )}
                            <p style={pStyle}>
                                <span style={spanStyle}>Shipping Charge:</span>
                                <span>{shippingCharge.toFixed(2)}</span>
                            </p>
                            {discount > 0 && (
                                <p style={pStyle}>
                                    <span style={spanStyle}>Discount:</span>
                                    <span>-{discount.toFixed(2)}</span>
                                </p>
                            )}
                            {paidAmount > 0 && (
                                <p style={pStyle}>
                                    <span style={spanStyle}>Paid:</span>
                                    <span>{paidAmount.toFixed(2)}</span>
                                </p>
                            )}
                            {(total - paidAmount) > 0 && (
                                <p style={pStyle}>
                                    <span style={spanStyle}>Due:</span>
                                    <span>{(total - paidAmount).toFixed(2)}</span>
                                </p>
                            )}
                            <p style={{
                                fontWeight: '700',
                                fontSize: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0'
                            }}>
                                <span style={spanStyle}>Total:</span>
                                <span>{currency} {total.toFixed(2)}</span>
                            </p>
                        </div>



                        {note && (
                            <p style={{
                                marginTop: '1rem',
                                fontStyle: 'italic',
                                color: '#4a5568',
                                fontSize: '0.875rem',
                                paddingTop: '1.5rem'
                            }}>
                                <strong>Note:</strong> {note}
                            </p>
                        )}

                    </>
                )}

                {selectedPreview === 'Delivery Note' && (
                    <>
                        <div className='flex justify-between'>

                            <div className='flex flex-col justify-around'>
                                <div className="flex flex-col justify-around h-full">
                                    <div className='space-y-2'>
                                        <h3 className="text-2xl font-medium mb-2">DELIVERY NOTE</h3>
                                        <p className='text-gray-500 text-sm font-medium'>#{invoiceNumber}</p>
                                    </div>
                                    <div className='text-sm font-semibold'>
                                        <p>Balance Due</p>
                                        <p>{currency} {total - paidAmount}</p>
                                    </div>
                                </div>
                                <p className="text-sm mb-4">Date: {formatDate(invoiceDate)}</p>
                            </div>
                            <div>
                                {
                                    orgInformation
                                }
                                <div className='space-y-2 text-sm'>
                                    <h4 className=" mb-2">Bill To:</h4>
                                    <p className=' max-w-[200px] font-semibold whitespace-break-spaces font-semibold'>{`${customerInfo?.firstName || "Another"} ${customerInfo?.lastName || "Customer"}`}</p>
                                    <p className='w-[200px]'>{customerInfo?.billingAddress || ""}</p>
                                    <p>{customerInfo?.phone || ""}</p>
                                </div>
                            </div>
                        </div>
                        <table style={tableStyle}>
                            <thead>
                                <tr >
                                    <th style={thStyle}>#</th>
                                    <th style={thStyle}>Item</th>
                                    <th style={thStyle}>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td style={tdStyle}>{index + 1}</td>
                                        <td style={tdStyle}>{item?.name}</td>
                                        <td style={tdStyle}>{item?.quantity} {item?.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p style={{
                            marginTop: '1rem',
                            fontSize: '0.875rem',
                            color: '#4a5568',
                            paddingTop: '0.5rem',
                            paddingBottom: '1rem'
                        }}>
                            <strong className='text-gray-500'>Notes:</strong> {note}
                        </p>


                        <div className="mt-4">
                            <p className="font-semibold text-gray-500">Authorized Signature: ______________________</p>
                        </div>
                    </>
                )
                }

                {
                    selectedPreview === 'Packaging Slip' && (
                        <>
                            <div className='flex justify-between'>

                                <div className='flex flex-col justify-around'>
                                    <div className="flex flex-col justify-around h-full">
                                        <div className='space-y-2'>
                                            <h3 className="text-2xl font-medium mb-2">PACKING SLIP</h3>
                                            <p className='text-gray-500 text-sm font-medium'>#{invoiceNumber}</p>
                                        </div>
                                        <div className='text-sm font-semibold'>
                                            <p>Balance Due</p>
                                            <p>{currency} {total - paidAmount}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm mb-4">Date: {formatDate(invoiceDate)}</p>
                                </div>
                                <div>
                                    {
                                        orgInformation
                                    }
                                </div>
                            </div>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>Item</th>
                                        <th style={thStyle}>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>

                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>{item?.name}</td>
                                            <td style={tdStyle}>{item?.quantity} {item?.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p style={{
                                marginTop: '1rem',
                                fontSize: '0.875rem',
                                paddingTop: '0.5rem',
                                color: '#4a5568',
                            }}>
                                <strong className='text-gray-500'>Notes:</strong> {note}
                            </p>
                        </>
                    )
                }
            </div >
        );
    };

    return (
        <div className="mx-auto flex w-72 items-center justify-center">
            <div className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
                <div onClick={(e_) => e_.stopPropagation()} className={`absolute w-fit min-w-[90%] md:min-w-[60%] max-h-[90%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
                    <div className="px-5 pb-5 pt-3 lg:pb-10 lg:pt-5 lg:px-10">
                        <div className='flex justify-between flex-wrap'>
                            <div className="flex space-x-4 mt-4">
                                <button className={`${selectedPreview === 'Invoice' ? "btn-gray2" : "btn-gray"}`} onClick={() => handlePreview('Invoice')}>Invoice</button>
                                <button className={`${selectedPreview === 'Delivery Note' ? "btn-gray2" : "btn-gray"}`} onClick={() => handlePreview('Delivery Note')}>Delivery Note</button>
                                <button className={`${selectedPreview === 'Packaging Slip' ? "btn-gray2" : "btn-gray"}`} onClick={() => handlePreview('Packaging Slip')}>Packaging Slip</button>
                            </div>
                            <div className="mt-5 space-x-4">
                                <button className='px-2 py-1 text-sm bg-orange-500 text-white rounded-sm' onClick={handlePrint}>Print</button>
                                <button className='px-2 py-1 text-sm bg-blue-500 text-white rounded-sm' onClick={handleSavePDF}>Save PDF</button>
                                <button className='px-2 py-1 text-sm bg-slate-300 text-black font-semibold rounded-sm' onClick={() => {
                                    if (resetStates) {
                                        resetStates(null)
                                    }
                                    setOpenModal(false)
                                }}>Close</button>
                            </div>
                        </div>
                        <div className="mt-5" id='printable-area'>
                            {renderPreview()}
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
};

export default PrintInvoiceModal;
