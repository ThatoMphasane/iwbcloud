// CheckoutPage.js
import React, { useState, useEffect } from "react";

// Input Field component used in the form
const InputField = ({ label, name, value, onChange, required, type = "text", placeholder }) => {
  return (
    <div className="input-container">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
};

// Accept navigation props
const CheckoutPage = ({ onReturnToCart, onContinueShopping }) => {
  // State for cart data (loaded from localStorage for display)
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  // userId is loaded but not sent to checkout route as per backend
  const [userId, setUserId] = useState('guest');

  // State for form and UI
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    address: '',
    paymentInfo: '', // Placeholder for payment details
  });
  const [orderStatus, setOrderStatus] = useState(null); // 'success', 'error', or null
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error message state

  // API configuration
  const API_BASE_URL = 'http://localhost:5000';

  // Simple API wrapper for consistency
  const api = {
    get: async (url) => {
      const response = await fetch(`${API_BASE_URL}${url}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Attempt to parse error body
        throw new Error(errorData.error || `API GET error: ${response.status}`);
      }
      return response.json();
    },
    post: async (url, data) => {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Attempt to parse error body
        throw new Error(errorData.error || `API POST error: ${response.status}`);
      }
      return response.json();
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Load cart items and buyer information when component mounts
  useEffect(() => {
    // Retrieve data from localStorage (used for displaying summary)
    const storedCartItems = JSON.parse(localStorage.getItem('checkoutCartItems') || '[]');
    const storedTotal = parseFloat(localStorage.getItem('checkoutTotal') || '0');
    const storedUserId = localStorage.getItem('checkoutUserId') || 'guest'; // Load user ID

    // Set cart state (for display purposes)
    setCartItems(storedCartItems);
    setTotalAmount(storedTotal);
    setUserId(storedUserId); // Keep userId state

    // Load buyer info from localStorage or initialize
    const storedBuyerInfo = JSON.parse(localStorage.getItem('buyerInfo') || '{}');
    setBuyerInfo({
      name: storedBuyerInfo.name || '',
      email: storedBuyerInfo.email || '',
      address: storedBuyerInfo.address || '',
      paymentInfo: storedBuyerInfo.paymentInfo || '',
    });

  }, []); // Empty dependency array means this runs only once on mount

  // Handle input changes and save to localStorage
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedBuyerInfo = {
      ...buyerInfo,
      [name]: value,
    };

    // Update state and save to localStorage
    setBuyerInfo(updatedBuyerInfo);
    localStorage.setItem('buyerInfo', JSON.stringify(updatedBuyerInfo));
  };

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    // Validate form inputs
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.address || !buyerInfo.paymentInfo) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!isValidEmail(buyerInfo.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Note: We don't check cartItems.length here before submitting
    // because the backend will do that check based on the database cart.
    // However, the submit button is disabled if cartItems.length is 0
    // based on the localStorage state, which is good UX.


    setLoading(true); // Start loading state

    try {
      // *** KEY CHANGE: Only send customerName as required by backend ***
      const response = await api.post("/api/checkout", {
        customerName: buyerInfo.name
        // Backend fetches cart items from DB, so we don't send them here
        // Backend calculates total price, so we don't send it here
        // Backend doesn't use customerEmail, shippingAddress, userId, paymentInfo
        // for the SalesRecord creation based on your provided code.
        // If you need these stored with the sale, you'll need to modify the backend.
      });

      console.log("Order placed successfully:", response);
      setOrderStatus('success'); // Set order status to success

      // Clear local cart data and buyer info after successful order
      // This matches the backend clearing the server-side cart.
      // We clear the "checkout" specific localStorage items here.
      localStorage.removeItem('checkoutCartItems');
      localStorage.removeItem('checkoutTotal');
      localStorage.removeItem('checkoutUserId');
      // localStorage.removeItem('customerName'); // Assuming customerName might be stored separately too - remove if buyerInfo is the source
      localStorage.removeItem('buyerInfo'); // Clear saved buyer info from localStorage

      // Optionally clear state after successful checkout for UI update
      setCartItems([]);
      setTotalAmount(0);
      setBuyerInfo({ name: '', email: '', address: '', paymentInfo: '' });

       // Clear the main cart storage as well, since the order is placed
       // This assumes the backend successfully processed the order and cleared the server-side cart.
       // If the backend doesn't manage the cart, you might need to clear the 'cart' localStorage item here too.
       // localStorage.removeItem('cart'); // <-- Uncomment this if your backend clears the cart on checkout

    } catch (error) {
      console.error("Error placing order:", error);
      setOrderStatus('error'); // Set order status to error
      setError(error.message || "Failed to process your order. Please try again.");
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Handle returning to cart - USE PROP FUNCTION
  const handleReturnToCart = () => {
     if (onReturnToCart) {
       onReturnToCart(); // Call the prop function
     } else {
        alert('Return to Cart navigation not configured.'); // Fallback alert
     }
  };

  // Handle continue shopping - USE PROP FUNCTION
  const handleContinueShopping = () => {
     if (onContinueShopping) {
       onContinueShopping(); // Call the prop function
     } else {
       alert('Continue Shopping navigation not configured.'); // Fallback alert
     }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="back-to-cart">
        {/* Use the prop function for navigation */}
        <button onClick={handleReturnToCart} className="back-button">
          ← Back to Cart
        </button>
      </div>
      {/* Only show total before successful order */}
      {orderStatus !== 'success' && <h4>Order Total: {formatCurrency(totalAmount)}</h4>}

      {error && <div className="error-message">{error}</div>}

      {orderStatus === 'success' ? (
        <div className="success-message">
          <h3>🎉 Thank you for your order!</h3>
          <p>Your order has been placed successfully.</p>
          {/* Display order summary on success using the state loaded from localStorage */}
          {/* Ensure cartItems state is not empty before displaying summary */}
          {cartItems.length > 0 && (
            <>
              <h4>Order Summary</h4>
              <ul className="order-items">
                {/* Use keys that are unique for each item in the list */}
                {cartItems.map(item => (
                  <li key={item._id || item.productId || item.name}> {/* Use _id, productId, or name as key */}
                    <span className="item-name">{item.name || 'Product'}</span> {/* Use item.name if available */}
                    <span className="item-quantity">x{item.quantity}</span>
                    {/* Use item.price which was stored in localStorage */}
                    <span className="item-price">{formatCurrency((item.price || 0) * item.quantity)}</span>
                  </li>
                ))}
                 <li className="order-total">
                  <span>Total:</span>
                  {/* Use the totalAmount state loaded from localStorage */}
                  <span>{formatCurrency(totalAmount)}</span>
                </li>
              </ul>
            </>
          )}
           {/* Display customer email if available in state */}
          {buyerInfo.email && <p>A confirmation email will be sent to {buyerInfo.email}</p>}
          {/* Use the prop function for navigation */}
          <button onClick={handleContinueShopping} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      ) : orderStatus === 'error' ? (
        <div className="error-container">
          <h3>⚠️ Order Processing Error</h3>
          <p>{error || "There was an error processing your order. Please try again later."}</p>
          {/* Clear the error status to allow retrying */}
          <button onClick={() => setOrderStatus(null)} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        // Show the form only if order hasn't been processed
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h3>Customer Information</h3>
            <InputField
              label="Full Name"
              name="name"
              value={buyerInfo.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
            <InputField
              label="Email Address"
              name="email"
              value={buyerInfo.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="Enter your email address"
            />
            <InputField
              label="Shipping Address"
              name="address"
              value={buyerInfo.address}
              onChange={handleChange}
              required
              placeholder="Enter your complete shipping address"
            />
          </div>

          <div className="form-section">
            <h3>Payment Information</h3>
            {/* WARNING: This is a placeholder. Handle payment info securely in a real app. */}
            <InputField
              label="Credit Card Details"
              name="paymentInfo"
              value={buyerInfo.paymentInfo}
              onChange={handleChange}
              required
              placeholder="Enter your credit card number (placeholder)"
            />
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            {/* Display summary from the state loaded from localStorage */}
            {cartItems.length > 0 ? (
              <ul className="order-items">
                 {/* Use keys that are unique for each item in the list */}
                {cartItems.map(item => (
                  <li key={item._id || item.productId || item.name}> {/* Use _id, productId, or name as key */}
                    <span className="item-name">{item.name || 'Product'}</span> {/* Use item.name if available */}
                    <span className="item-quantity">x{item.quantity}</span>
                     {/* Use item.price which was stored in localStorage */}
                    <span className="item-price">{formatCurrency((item.price || 0) * item.quantity)}</span>
                  </li>
                ))}
                <li className="order-total">
                  <span>Total:</span>
                   {/* Use the totalAmount state loaded from localStorage */}
                  <span>{formatCurrency(totalAmount)}</span>
                </li>
              </ul>
            ) : (
              <p>Your cart is empty. Add items from the product page.</p>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || cartItems.length === 0} // Disable if loading or local cart is empty
          >
            {loading ? "Processing Order..." : "Place Order"}
          </button>
        </form>
      )}

      {/* Moved style block inside the component */}
      <style jsx>{`
        .checkout-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        h2 {
          margin-bottom: 10px;
          color: #333;
        }

        h4 {
          margin-bottom: 20px;
          color: #666;
        }

        .back-to-cart {
          margin-bottom: 20px;
        }

        .back-button {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .back-button:hover {
          text-decoration: underline;
        }

        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .success-message {
          background-color: #d1fae5;
          color: #047857;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .success-message h3 {
          margin-top: 0;
        }

        .success-message ul {
          padding-left: 20px; /* Add padding for list items */
        }

        .continue-shopping {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 15px;
        }

        .continue-shopping:hover {
          background-color: #2563eb;
        }

        .error-container {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .retry-button {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
        }

        .retry-button:hover {
          background-color: #dc2626;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .form-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #374151;
        }

        .input-container {
          margin-bottom: 15px;
        }

        .input-container label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #4b5563;
        }

        .input-container .required {
          color: #ef4444;
        }

        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .order-summary {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .order-summary h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #374151;
        }

        .order-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .order-items li {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-items li:last-child {
          border-bottom: none;
        }

        .item-name {
          flex: 2;
          font-weight: 500;
        }

        .item-quantity {
          flex: 1;
          text-align: center;
          color: #6b7280;
        }

        .item-price {
          flex: 1;
          text-align: right;
          font-weight: 500;
        }

        .order-total {
          margin-top: 10px;
          font-weight: bold;
          color: #1f2937;
          border-top: 2px solid #e5e7eb !important;
          padding-top: 15px !important;
        }

        .submit-button {
          background-color: #3b82f6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          margin-top: 10px;
        }

        .submit-button:hover {
          background-color: #2563eb;
        }

        .submit-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .checkout-container {
            padding: 15px;
          }

          .form-section,
          .order-summary {
            padding: 15px;
          }

          .input-field {
            padding: 8px;
          }

          .submit-button {
            padding: 10px 15px;
          }

          .item-quantity {
            /* Hide quantity on small screens if desired */
            /* display: none; */
          }

          .item-name {
            /* Adjust flex based on whether quantity is shown */
            /* flex: 1; */
          }
        }
      `}</style>
    </div>
  );
};

// Export the component directly
export default CheckoutPage;