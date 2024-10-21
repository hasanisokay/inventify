"use client";
import getCustomerDetails from "@/utils/getCustomerDetails.mjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const NewCustomer = ({ id = null }) => {
const [updateable, setUpdateable] = useState(false);
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerType, setCustomerType] = useState("Individual");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingCode, setBillingCode] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingCode, setShippingCode] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [note, setNote] = useState("")
  const [facebookId, setFacebookId] = useState("")
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const salutations = [
    { value: "Mr", label: "Mr" },
    { value: "Ms", label: "Ms" },
    { value: "Mrs", label: "Mrs" },
    { value: "Dr", label: "Dr" },
    { value: "Prof", label: "Prof" },
    { value: "", label: "" },
  ];

  const customerTypes = [
    { value: "Individual", label: "Individual" },
    { value: "Business", label: "Business" },
  ];

  useEffect(() => {
    (async () => {
      if (!id) return;
      if (id) {
        setLoading(true);
        const data = await getCustomerDetails(id);
        if (data) {
          setUpdateable(true)
          setSalutation(data.salutation || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setCustomerType(data.customerType || "Individual");
          setCompanyName(data.companyName || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setBillingAddress(data.billingAddress || "");
          setBillingStreet(data.billingStreet || "");
          setBillingCity(data.billingCity || "");
          setBillingState(data.billingState || "");
          setBillingCountry(data.billingCountry || "");
          setBillingCode(data.billingCode || "");
          setShippingAddress(data.shippingAddress || "");
          setShippingStreet(data.shippingStreet || "");
          setShippingCity(data.shippingCity || "");
          setShippingState(data.shippingState || "");
          setShippingCountry(data.shippingCountry || "");
          setShippingCode(data.shippingCode || "");
          setSameAddress(
            data.billingAddress === data.shippingAddress &&
            data.billingStreet === data.shippingStreet &&
            data.billingCity === data.shippingCity &&
            data.billingState === data.shippingState &&
            data.billingCountry === data.shippingCountry &&
            data.billingCode === data.shippingCode
          );
          setNote(data.note || "");
          setFacebookId(data.facebookId || "");
        }
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerData = {
      salutation,
      firstName,
      lastName,
      customerType,
      companyName,
      phone,
      email,
      billingAddress,
      billingStreet,
      billingCity,
      billingState,
      billingCountry,
      billingCode,
      shippingAddress: sameAddress ? billingAddress : shippingAddress,
      shippingStreet: sameAddress ? billingStreet : shippingStreet,
      shippingCity: sameAddress ? billingCity : shippingCity,
      shippingState: sameAddress ? billingState : shippingState,
      shippingCountry: sameAddress ? billingCountry : shippingCountry,
      shippingCode: sameAddress ? billingCode : shippingCode,
      createdTime: new Date(),
      lastModifiedTime: new Date(),
      note,
      facebookId
    };
    let apiPath = `/api/adds/new-customer`
    let method = "POST"
    if (updateable) {
      customerData.id = id;
      apiPath = `/api/updates/customer`
    method = "PUT"
    }

    const res = await fetch(apiPath, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData),
      credentials: "include",
    })
    const data = await res.json();
    if (data.status === 201 || data.status === 200) {
      toast.success(data?.message)
      if (id) {
        router?.back()
      }
    } else { toast.error(data?.message) }
  };

  return (
    <div className="container mx-auto p-8">
      <form onSubmit={handleSubmit} className={`${loading ? "form-disabled" : ""}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Salutation:</label>
            <Select
              options={salutations}
              value={salutations.find((s) => s.value === salutation)}
              onChange={(selected) => setSalutation(selected.value)}
              className="w-[200px]"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">First Name:</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Last Name:</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Customer Type:</label>
            <Select
              options={customerTypes}
              value={customerTypes.find((c) => c.value === customerType)}
              onChange={(selected) => setCustomerType(selected.value)}
              className="w-[200px]"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Company Name:</label>
            <input
              type="text"
              placeholder="Optional"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Phone:</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Email:</label>
            <input
              type="email"
              placeholder="Optional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label className="font-semibold mr-2 w-32">Facebook Id:</label>
            <input
              type="text"
              placeholder="Opional"
              value={facebookId}
              onChange={(e) => setFacebookId(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <h2 className="font-semibold mt-10 mb-2">Billing Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Address:</label>
            <input
              type="text"
              required
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Street:</label>
            <input
              type="text"
              value={billingStreet}
              onChange={(e) => setBillingStreet(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">City:</label>
            <input
              type="text"
              required
              value={billingCity}
              onChange={(e) => setBillingCity(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">State:</label>
            <input
              type="text"
              required
              value={billingState}
              onChange={(e) => setBillingState(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Country:</label>
            <input
              type="text"
              required
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Postal Code:</label>
            <input
              type="text"
              required
              value={billingCode}
              onChange={(e) => setBillingCode(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <h2 className="font-semibold mt-10 mb-2">Shipping Address</h2>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={sameAddress}
            onChange={() => setSameAddress(!sameAddress)}
            className="mr-2"
          />
          <label className="font-semibold">Shipping address same as billing address</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Address:</label>
            <input
              type="text"
              value={sameAddress ? billingAddress : shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Street:</label>
            <input
              type="text"
              value={sameAddress ? billingStreet : shippingStreet}
              onChange={(e) => setShippingStreet(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">City:</label>
            <input
              type="text"
              value={sameAddress ? billingCity : shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">State:</label>
            <input
              type="text"
              value={sameAddress ? billingState : shippingState}
              onChange={(e) => setShippingState(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Country:</label>
            <input
              type="text"
              value={sameAddress ? billingCountry : shippingCountry}
              onChange={(e) => setShippingCountry(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="font-semibold mr-2 w-32">Postal Code:</label>
            <input
              type="text"
              value={sameAddress ? billingCode : shippingCode}
              onChange={(e) => setShippingCode(e.target.value)}
              className="w-[200px] p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex items-center my-6">
          <label className="font-semibold mr-2 w-32">Note:</label>
          <textarea
            value={note}
            placeholder="Any note for this customer. Ex: এই লোক ডেলিভারি নেয়না"
            onChange={(e) => setNote(e.target.value)}
            className="form-textarea"
          />
        </div>

        <button type="submit" className="w-[200px] p-2 bg-green-500 text-white rounded" disabled={loading}>
          {updateable ? "Update" : "Save"}
        </button>
      </form>
    </div>
  );
};

export default NewCustomer;
