import formatDate from "@/utils/formatDate.mjs";
const ItemReportDownloadModal = ({ openModal, setOpenModal, items, startDate, endDate, companyName, keyword }) => {

    // Calculate totalOrder sum and totalAmount sum
    const totalOrderSum = items.reduce((acc, item) => acc + item.totalOrder, 0);
    const totalAmountSum = items.reduce(
        (acc, item) => acc + item?.totalAmount,
        0
    );


    const printReport = () => {
        const content = document.getElementById("printable-report").innerHTML;

        // Create an iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document.open();
        doc.write(`
            <html>
              <head>
                <title>Item Report</title>
              </head>
              <body style="font-family: Arial, sans-serif; margin: 20px;">
                <h2 style="text-align: center; font-size:24px; font-weight: 400; color: #606060;">${companyName}</h2>
                <h2 style="text-align: center; font-size:24px;">Item Sales Report</h2>
                <p style="text-align: center;">
                  <span style="padding-left:5px; padding-right:5px;">From </span>
                  <span style="font-weight: 600;">${formatDate(new Date(startDate))}</span>
                  <span style="padding-left:5px; padding-right:5px;"> To </span>
                  <span style="font-weight: 600;">${formatDate(new Date(endDate))}</span>
                </p>
                ${keyword ? `<p style="text-align: center;"> <span style="padding-left:10px; padding-right:10px;">Searched Keyword </span> <span style="font-weight: 600;">${keyword}</span> </p>` : ''}
                  <div style={{ margin-top: 16px; display: flex; gap:10px; align-items:center; justify-content: center;}>
                        <span>Total Unit Sold:</span>
                        <span style="font-weight: 600;">${totalOrderSum}</span>
                    </div>
      <div style={{ margin-top: 16px; display: flex; gap:10px; align-items:center; justify-content: center;}>
                        <span>Total Amount:</span>
                        <span style="font-weight: 600;">BDT ${totalAmountSum.toFixed(2)}</span>
                    </div>
                    
                ${content}
              </body>
            </html>
          `);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Remove the iframe after printing
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };


    //     const printReport = () => {
    //         const content = document.getElementById("printable-report").innerHTML;
    //         const printWindow = window.open("", "_blank");
    //         // const printWindow = window.open("", "");
    //         printWindow.document.write(`
    //         <html>
    //           <head>
    //             <title>Item Report</title>
    //           </head>
    //           <body style="font-family: Arial, sans-serif; margin: 20px;">
    //             <h2 style="text-align: center; font-size:24px; font-weight: 400; color: #606060;">${companyName}</h2>
    //             <h2 style="text-align: center; font-size:24px;">Item Sales Report</h2>
    //             <p style="text-align: center;">
    //               <span style="padding-left:5px; padding-right:5px;">From </span>
    //               <span style="font-weight: 600;">${formatDate(new Date(startDate))}</span>
    //               <span style="padding-left:5px; padding-right:5px;"> To </span>
    //               <span style="font-weight: 600;">${formatDate(new Date(endDate))}</span>
    //             </p>
    //             ${keyword ? `<p style="text-align: center;"> <span style="padding-left:10px; padding-right:10px;">Searched Keyword </span> <span style="font-weight: 600;">${keyword}</span> </p>` : ''}
    //               <div style={{ margin-top: 16px; display: flex; gap:10px; align-items:center; justify-content: center;}>
    //                     <span>Total Unit Sold:</span>
    //                     <span style="font-weight: 600;">${totalOrderSum}</span>
    //                 </div>
    //   <div style={{ margin-top: 16px; display: flex; gap:10px; align-items:center; justify-content: center;}>
    //                     <span>Total Amount:</span>
    //                     <span style="font-weight: 600;">BDT ${totalAmountSum.toFixed(2)}</span>
    //                 </div>

    //             ${content}
    //           </body>
    //         </html>
    //       `);
    //         printWindow.document.close();
    //         printWindow.print();
    //     };

    return (
        <div style={{ position: "fixed", inset: "0", zIndex: "500", display: openModal ? "flex" : "none", alignItems: "center", justifyContent: "center" }}>
            <div onClick={() => setOpenModal(false)} style={{ position: "fixed", inset: "0", backgroundColor: "rgba(0, 0, 0, 0.5)", transition: "opacity 0.3s", backdropFilter: "blur(5px)" }}></div>
            <div onClick={(e) => e.stopPropagation()} style={{
                position: "relative", width: "100%", maxWidth: "800px", maxHeight: "90%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                transform: openModal ? "translateY(0)" : "translateY(-20px)", opacity: openModal ? "1" : "0", transition: "all 0.3s", padding: "16px", overflowY: "auto"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "8px", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>Item Report</h2>
                    <button onClick={() => setOpenModal(false)} style={{ background: "none", border: "none", fontSize: "24px", color: "#888", cursor: "pointer" }}>&times;</button>
                </div>
                <div style={{ marginTop: "16px", display: "flex", gap: '10px', alignItems: 'center', justifyContent: 'center', fontWeight: "600" }}>
                    <span>Total Unit Sold:</span>
                    <span>{totalOrderSum}</span>
                </div>
                <div style={{ display: "flex", gap: '10px', alignItems: 'center', justifyContent: 'center', fontWeight: "600" }}>
                    <span>Total Amount:</span>
                    <span>BDT {totalAmountSum.toFixed(2)}</span>
                </div>

                <button className='px-2 py-1 text-sm bg-orange-500 text-white rounded-sm' onClick={printReport}>Print</button>

                <div id="printable-report" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f4f4f4", }}>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left", fontWeight: '600', color: '#606060' }}>ITEM NAME</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left", fontWeight: '600', color: '#606060' }}>QUANTITY SOLD</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left", fontWeight: '600', color: '#606060' }}>AMOUNT</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left", fontWeight: '600', color: '#606060' }}>AVG PRICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items?.map((item, idx) => (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.name}</td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item?.totalOrder} {item?.unit}</td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>BDT {item.totalAmount.toFixed(2)}</td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>BDT {(item?.totalAmount / item?.totalOrder || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #ddd", paddingTop: "8px", marginTop: "16px" }}>
                    <button onClick={printReport} style={{
                        backgroundColor: "#1D4ED8", color: "white", fontWeight: "600", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", border: "none", transition: "background 0.3s"
                    }} onMouseOver={(e) => e.target.style.backgroundColor = "#2563EB"} onMouseOut={(e) => e.target.style.backgroundColor = "#1D4ED8"}>Print</button>
                    <button onClick={() => setOpenModal(false)} style={{
                        backgroundColor: "#E5E7EB", color: "#333", fontWeight: "600", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", border: "none", transition: "background 0.3s"
                    }} onMouseOver={(e) => e.target.style.backgroundColor = "#D1D5DB"} onMouseOut={(e) => e.target.style.backgroundColor = "#E5E7EB"}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ItemReportDownloadModal;
