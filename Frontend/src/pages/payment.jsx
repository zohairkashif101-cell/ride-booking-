import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Banknote,
  Loader2,
  ShieldCheck,
  Receipt,
  AlertCircle,
} from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";

const Payment = () => {
  const { rideId, amount } = useParams();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("userToken");
  const API_URL = `${import.meta.env.VITE_BASE_URL || "http://localhost:5000"}/api/payments`;

  // --------------------------------
  // GET PAYMENT DETAILS
  // --------------------------------
  const getPaymentDetails = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await axios.get(`${API_URL}/ride/${rideId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayment(response.data.payment);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message || "Unable to get payment details"
        );
      }
    } finally {
      setFetching(false);
    }
  };

  // --------------------------------
  // LOAD PAYMENT DETAILS
  // --------------------------------
  useEffect(() => {
    if (rideId && token) {
      getPaymentDetails();
    } else {
      setFetching(false);
      setError("Ride information or login session is missing.");
    }
  }, [rideId]);

  // --------------------------------
  // PROCESS PAYMENT
  // --------------------------------
  const handlePayment = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/process`,
        {
          rideId: rideId,
          amount: Number(amount),
          method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayment(response.data.payment);
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment processing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // LOADING SCREEN
  // --------------------------------
  if (fetching) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 size={36} className="animate-spin text-white" />
          <p className="text-sm font-semibold text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-black text-white border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-black tracking-tight">Settlement & Receipt</h1>
          </div>
          <BrandLogo inverted textClassName="text-lg" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* FARE SUMMARY CARD */}
        <div className="bg-black text-white rounded-3xl p-6 sm:p-7 mb-5 shadow-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Trip Fare
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={13} />
              <span>Ride Completed</span>
            </div>
          </div>

          <h2 className="text-4xl font-black mt-3 tracking-tight">
            Rs. {Number(amount || 0).toLocaleString()}
          </h2>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Receipt size={14} />
              Ride ID: {rideId ? rideId.slice(-8) : "N/A"}
            </span>
            <span className="flex items-center gap-1 text-gray-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              Verified Transaction
            </span>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* COMPLETED PAYMENT RECEIPT */}
        {payment ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h3 className="font-black text-lg text-black">Payment Confirmed</h3>
                <p className="text-xs text-gray-500">Official ride payment record</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-extrabold text-black">
                  Rs. {Number(payment.amount || amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-extrabold capitalize text-black">
                  {payment.method === "card" ? "Credit / Debit Card" : "Cash"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50">
                <span className="text-gray-500">Settlement Status</span>
                <span className="font-black capitalize text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {payment.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-gray-50">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-600 break-all">
                  {payment._id || rideId}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="w-full bg-black text-white py-4 rounded-2xl font-extrabold text-sm hover:bg-neutral-800 active:scale-[0.99] transition shadow-lg cursor-pointer"
            >
              Return to Home Dashboard
            </button>
          </div>
        ) : (
          /* PAYMENT METHOD SELECTION */
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100">
            <h3 className="font-black text-base text-black mb-1">
              Select Payment Method
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Choose how you want to settle the ride fare.
            </p>

            <div className="space-y-3">
              {/* CASH OPTION */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cash");
                  setError("");
                }}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition text-left cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-black bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Banknote size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-black">Cash Payment</p>
                  <p className="text-xs text-gray-500 truncate">
                    Pay the captain directly with cash
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "cash"
                      ? "border-black bg-black text-white"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "cash" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* CARD OPTION */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("card");
                  setError("");
                }}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition text-left cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-black bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-black">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500 truncate">
                    Instant secure electronic processing
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card"
                      ? "border-black bg-black text-white"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            {/* PROCESS PAYMENT BUTTON */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || !paymentMethod}
              className="w-full mt-6 bg-black text-white py-4 rounded-2xl font-extrabold text-sm hover:bg-neutral-800 active:scale-[0.99] transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Settlement...</span>
                </>
              ) : (
                <span>Confirm & Pay Rs. {Number(amount || 0).toLocaleString()}</span>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400">
        VELOX Mobility • Safe & Audited Payment Processing
      </footer>
    </div>
  );
};

export default Payment;