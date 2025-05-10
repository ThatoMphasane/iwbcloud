// HomePage.js
import React, { useState } from "react";
import FlashImage from './assets/Flash.jpg';
import m from './assets/ram.jpg';
import HDD from './assets/HDD.jpg';
import t from './assets/keyboard.webp';
import tt from './assets/SSD.jpg';
import ttt from './assets/motherboard.jpg';
import a from './assets/Screen.jpg';
import p from './assets/printer.jpg';
import aa from './assets/mouse.jpg';
import s from './assets/Optical.webp';

const HomePage = ({ navigateTo, cartItemsCount, currentUser }) => {
  // Static mock products data with specified names, prices, and images
  const [products] = useState([
    {
      _id: '1',
      name: 'Flash Drive (16GB)',
      price: 105,
      imageUrl: FlashImage
    },
    {
      _id: '2',
      name: 'Hard Disk Drive (256GB)',
      price: 600,
      imageUrl: HDD
    },
    {
      _id: '3',
      name: 'Solid State Drive (from M500)',
      price: 1500,
      imageUrl: tt
    },
    {
      _id: '4',
      name: 'Mother Board (from M2000)',
      price: 5000,
      imageUrl: ttt
    },
    {
      _id: '5',
      name: 'Screen (from M1200)',
      price: 2500,
      imageUrl: a
    },
    {
      _id: '6',
      name: 'Keyboard (from M100)',
      price: 300,
      imageUrl: t
    },
    {
      _id: '7',
      name: 'Mouse (from M50)',
      price: 150,
      imageUrl: aa
    },
    {
      _id: '8',
      name: 'RAM (from M350)',
      price: 2000,
      imageUrl: m
    },
    // Additional products to make total 10
    {
      _id: '9',
      name: 'Printer',
      price: 3500,
      imageUrl: p
    },
    {
      _id: '10',
      name: 'External Optical Drive',
      price: 1800,
      imageUrl: s
    }
  ]);

  const handleProceedToCheckout = () => {
    if (!currentUser || !currentUser._id) {
      alert('Please login to proceed to checkout.');
    } else {
      alert('Proceeding to checkout...');
    }
  };

  return (
    <div
      className="main-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#f1f5f9',
      }}
    >
      {/* Header Section */}
      <header
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid #cbd5e1',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>
            Innovative Waste Bins
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigateTo("login")}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigateTo("register")}
            style={{
              padding: '8px 16px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Register
          </button>
          <button
            onClick={() => navigateTo("cart")}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              position: 'relative',
            }}
          >
            Cart {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a', marginBottom: '16px' }}>
            Sustainable Waste Management Solutions
          </h2>
          <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', marginBottom: '20px' }}>
            Welcome to Innovative Waste Bins, where we provide smarter, cleaner, and more sustainable waste solutions for businesses and communities.
          </p>
          <button
            onClick={handleProceedToCheckout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Proceed to Checkout
          </button>
        </section>

        {/* About Us Section */}
        <section
          style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a', marginBottom: '16px' }}>
            About Us
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
              Established in 2010, Innovative Waste Bins (IWB) is a leading provider of advanced waste management solutions. We are committed to creating a cleaner and more sustainable future through innovative product design and environmentally responsible manufacturing processes.
            </p>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
              Our mission is to reduce environmental impact through intelligent waste management systems that improve efficiency, encourage recycling, and minimize landfill contributions. IWB products are developed by a team of experienced engineers and environmental specialists who understand the unique challenges of modern waste management.
            </p>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
              We serve a diverse range of clients including municipal governments, educational institutions, healthcare facilities, corporate offices, and residential communities across the country. IWB is proud to be ISO 14001 certified, demonstrating our commitment to environmental management standards.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section
          style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a', marginBottom: '20px' }}>
            Our Products
          </h2>
          {/* Static products display with images */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '20px', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>
                    {product.name}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
                    M{product.price}
                  </p>
                  {/* You can add an "Add to Cart" button here if needed */}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: '20px',
            padding: '20px 0',
            borderTop: '1px solid #cbd5e1',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          <p>© {new Date().getFullYear()} Innovative Waste Bins. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
