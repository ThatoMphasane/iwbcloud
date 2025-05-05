import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

const ClientQueryPage = () => {
  // State for the contact form
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  // State for the list of historical queries
  const [queries, setQueries] = useState([]); // Initial state is an empty array
  // State for automated responses fetched from the backend
  const [automatedResponses, setAutomatedResponses] = useState([]);
  // Loading state for the contact form submission
  const [formLoading, setFormLoading] = useState(false);
  // Message shown to the user after submitting the form (automated response)
  const [responseMessage, setResponseMessage] = useState('');
  // State to control visibility of the automated response message
  const [showResponse, setShowResponse] = useState(false);
  // State to hold any form submission error message
  const [formError, setFormError] = useState(null);
  // State to hold any automated response fetching error
  const [automatedResponsesError, setAutomatedResponsesError] = useState(null);

  // --- Pagination State ---
  // Current page number for fetching queries
  const [currentPage, setCurrentPage] = useState(1);
  // Number of queries to display per page (fixed for now)
  const [queriesPerPage] = useState(5);
  // Total number of queries available on the backend
  const [totalQueries, setTotalQueries] = useState(0);
  // Loading state for fetching historical queries
  const [queriesLoading, setQueriesLoading] = useState(false);
  // State to hold any error message from fetching queries
  const [queriesError, setQueriesError] = useState(null);

  // --- Effects ---

  // Fetch automated responses on component mount (only once)
  useEffect(() => {
    const fetchAutomatedResponses = async () => {
      try {
        const responsesResponse = await axios.get(`${API_BASE_URL}/automated-responses`);
        // Ensure the response data is an array before setting state
        if (Array.isArray(responsesResponse.data)) {
          setAutomatedResponses(responsesResponse.data);
          setAutomatedResponsesError(null); // Clear previous error on success
        } else {
          console.error('Automated responses API returned non-array data:', responsesResponse.data);
          setAutomatedResponses([]); // Set to empty array in case of unexpected data
          setAutomatedResponsesError('Failed to load automated responses: Invalid data format.');
        }
      } catch (err) {
        console.error('Error fetching automated responses:', err);
        setAutomatedResponses([]); // Set to empty array on error
        setAutomatedResponsesError('Failed to load automated responses. Please try again later.');
      }
    };

    fetchAutomatedResponses();
  }, []); // Empty dependency array ensures this runs only once

  // Fetch queries for the current page whenever currentPage or queriesPerPage changes
  // Using useCallback to memoize the function and prevent unnecessary re-creation
  const fetchQueries = useCallback(async () => {
    setQueriesLoading(true);
    setQueriesError(null); // Clear previous errors
    try {
      const queriesResponse = await axios.get(`${API_BASE_URL}/queries`, {
        params: {
          page: currentPage,
          limit: queriesPerPage,
          // TODO: If queries are user-specific, include user ID or authentication token here
          // headers: { 'Authorization': `Bearer ${userToken}` } // Example
        }
      });

      // Assuming your backend response includes the list of queries for the page
      // and the total count of all queries matching the criteria (e.g., user)
      // Example response structure: { queries: [...], totalCount: 25 }
      if (queriesResponse.data && Array.isArray(queriesResponse.data.queries)) {
        setQueries(queriesResponse.data.queries);
        setTotalQueries(queriesResponse.data.totalCount || 0); // Default to 0 if totalCount is missing
      } else {
        // Handle unexpected response structure
        console.error('Unexpected API response structure for queries:', queriesResponse.data);
        setQueries([]); // Ensure queries is always an array
        setTotalQueries(0);
        setQueriesError('Received unexpected data format from the server for queries.');
      }

    } catch (err) {
      console.error('Error fetching queries:', err);
      setQueriesError('Failed to load previous queries. Please try again.');
      setQueries([]); // Clear queries on error, ensuring it's an array
      setTotalQueries(0); // Reset total count
    } finally {
      setQueriesLoading(false);
    }
  }, [currentPage, queriesPerPage]); // Dependencies for fetchQueries useCallback

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]); // Dependency array for useEffect, depends on the memoized fetchQueries


  // --- Handlers ---

  // Handle changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure name and value
    setForm(prevForm => ({ ...prevForm, [name]: value })); // Use functional update for safety
  };

  // Find the most appropriate automated response based on query content
  const findMatchingResponse = (message) => {
    // Use a default message if automated responses are not loaded or empty
    const defaultMessage = "Thank you for your query. Our team will get back to you shortly.";

    // Check if automatedResponses is a valid array and has items
    if (!Array.isArray(automatedResponses) || automatedResponses.length === 0) {
      return defaultMessage;
    }

    // Convert message to lowercase for case-insensitive matching
    const lowercaseMessage = message.toLowerCase();

    // Iterate through automated responses to find a match based on keywords
    // Use simple string inclusion for keyword matching (backend would use NLP)
    for (const response of automatedResponses) {
      // Ensure response and keywords are valid before checking
      if (response && Array.isArray(response.keywords) && response.keywords.some(keyword =>
        keyword && typeof keyword === 'string' && lowercaseMessage.includes(keyword.toLowerCase())
      )) {
        // Return response text, falling back to default if responseText is missing
        return response.responseText || defaultMessage;
      }
    }

    // If no keyword match is found, find a default response
    const defaultResponse = automatedResponses.find(r => r && r.isDefault); // Check for response validity

    // Return the default response text or a final fallback message
    return defaultResponse ? defaultResponse.responseText : defaultMessage;
  };

  // Handle the submission of the contact form
  const handleQuerySubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setFormLoading(true); // Set loading state for the form
    setFormError(null); // Clear previous form errors
    setShowResponse(false); // Hide previous response message

    // Basic form validation
    if (!form.name || !form.email || !form.message) {
      setFormError('Please fill in all fields.');
      setFormLoading(false);
      return;
    }

    // Simple email format validation (can be more complex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
        setFormError('Please enter a valid email address.');
        setFormLoading(false);
        return;
    }


    try {
      // Find the appropriate automated response based on the message content
      const matchedResponse = findMatchingResponse(form.message);
      setResponseMessage(matchedResponse); // Store the found response message

      // Submit the query to the backend API
      // Added a timeout to the axios request for better error handling
      const response = await axios.post(`${API_BASE_URL}/queries`, {
        ...form,
        // TODO: If associating the query with a user server-server, ensure the backend
        // receives the necessary user identifier (e.g., from authentication token)
        automatedResponse: matchedResponse // Optionally store the automated response with the query
      }, { timeout: 10000 }); // 10 seconds timeout

      // --- Post-Submission Actions ---
      // After successful submission, re-fetch the queries to update the list.
      // Pass the current page to ensure the list stays on the same page if possible.
      // We should ideally re-fetch the *current* page to see the new query if it falls there.
      // However, if the new query is always added to the *start* of the list on the backend,
      // re-fetching the first page might be more appropriate. Let's re-fetch the current page for now.
      await fetchQueries(); // Use the memoized fetchQueries function

      // Show the automated response to the user
      setShowResponse(true);

      // Reset the form to its initial empty state
      setForm({ name: '', email: '', message: '' });

    } catch (err) {
      console.error('Submission error:', err);
      // Provide more specific error messages based on the response
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setFormError(`Submission failed: ${err.response.status} - ${err.response.data?.error || 'Server error.'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setFormError('Submission failed: No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setFormError('Submission failed: An unexpected error occurred.');
      }
      setShowResponse(false); // Ensure response message is hidden on error
    } finally {
      setFormLoading(false); // Hide form loading indicator
    }
  };

  // --- Pagination Logic ---

  // Calculate the total number of pages based on total queries and queries per page
  const totalPages = Math.ceil(totalQueries / queriesPerPage);

  // Handle changing the current page
  const handlePageChange = (pageNumber) => {
    // Ensure the page number is within valid bounds
    if (pageNumber > 0 && pageNumber <= totalPages && !queriesLoading) { // Added check for queriesLoading
      setCurrentPage(pageNumber);
    }
  };

  // Render the pagination controls (Previous/Next buttons)
  const renderPaginationControls = () => {
    // Only render controls if there's more than one page
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || queriesLoading}
          aria-disabled={currentPage === 1 || queriesLoading} // Accessibility attribute
          aria-label="Previous page" // Accessibility label
          style={{ marginRight: '10px', padding: '8px 15px', cursor: (currentPage === 1 || queriesLoading) ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || queriesLoading}
          aria-disabled={currentPage === totalPages || queriesLoading} // Accessibility attribute
          aria-label="Next page" // Accessibility label
          style={{ marginLeft: '10px', padding: '8px 15px', cursor: (currentPage === totalPages || queriesLoading) ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    );
  };


  // --- Render Function ---

  return (
    <div className="query-page-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'sans-serif', // Added a basic font family
      lineHeight: '1.6' // Added line height
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Contact Us</h2>

      {/* Display automated response message after submission */}
      {showResponse && (
        <div role="alert" style={{ // Added role="alert" for accessibility
          backgroundColor: '#e9f7ef', // Lighter green/blue for success
          border: '1px solid #28a745', // Green border
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px',
          color: '#155724' // Darker green text
        }}>
          <h3 style={{ marginTop: 0, color: '#155724' }}>Thank you for your query!</h3>
          <p>{responseMessage}</p>
          <button
            onClick={() => setShowResponse(false)}
            aria-label="Close response message" // Accessibility label
            style={{
              backgroundColor: '#28a745', // Green button
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Display form submission error message */}
       {formError && (
        <div role="alert" style={{ // Added role="alert" for accessibility
          backgroundColor: '#f8d7da', // Light red for error
          border: '1px solid #dc3545', // Red border
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px',
          color: '#721c24' // Darker red text
        }}>
          <p><strong>Error:</strong> {formError}</p>
        </div>
      )}

      {/* Display automated responses fetch error */}
      {automatedResponsesError && (
         <div role="alert" style={{ // Added role="alert" for accessibility
          backgroundColor: '#fff3cd', // Light yellow for warning
          border: '1px solid #ffc107', // Yellow border
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px',
          color: '#856404' // Darker yellow text
        }}>
          <p><strong>Warning:</strong> {automatedResponsesError}</p>
        </div>
      )}


      {/* Contact Form */}
      <form
        onSubmit={handleQuerySubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Added subtle shadow
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="name" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Name:</label>
          <input
            id="name" // Added id for accessibility
            name="name"
            type="text" // Explicitly set type
            value={form.name}
            onChange={handleChange}
            required
            disabled={formLoading} // Disable input while submitting
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc', // Slightly darker border
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Email:</label>
          <input
            id="email" // Added id for accessibility
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={formLoading} // Disable input while submitting
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc', // Slightly darker border
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="message" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Message:</label>
          <textarea
            id="message" // Added id for accessibility
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            disabled={formLoading} // Disable input while submitting
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc', // Slightly darker border
              minHeight: '120px',
              resize: 'vertical',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={formLoading}
          aria-disabled={formLoading} // Accessibility attribute
          style={{
            backgroundColor: '#007bff', // Blue button color
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            cursor: formLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'background-color 0.3s ease', // Added transition
            opacity: formLoading ? 0.7 : 1 // Reduce opacity when disabled
          }}
        >
          {formLoading ? 'Submitting...' : 'Submit Query'}
        </button>
      </form>

      {/* Historical Queries Section */}
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#333' }}>Previous Queries</h3>

      {/* Display loading or error message for queries */}
      {queriesLoading && (
        <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>Loading queries...</p>
      )}

      {queriesError && (
        <div role="alert" style={{ // Added role="alert" for accessibility
          backgroundColor: '#f8d7da',
          border: '1px solid #dc3545',
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px',
          color: '#721c24'
        }}>
          <p><strong>Error:</strong> {queriesError}</p>
        </div>
      )}

      {/* Display queries list or 'No queries' message */}
      {/* Ensure queries is an array before checking length and loading/error state */}
      {!queriesLoading && !queriesError && (
        <> {/* Wrap the content in a Fragment */}
          {/* Use a safe check for array and length */}
          {(Array.isArray(queries) && queries.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>No queries submitted yet.</p>
          ) : (
             // Ensure queries is an array before mapping
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}
            >
              {/* Map over the queries array to display each query */}
              {/* Use a safe way to map, defaulting to an empty array if queries is not an array */}
              {(Array.isArray(queries) ? queries : []).map((q) => (
                <li
                  key={q?._id || `query-${Math.random()}`} // Fallback key and safe access
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '15px',
                    backgroundColor: '#fff',
                    marginBottom: '10px', // Add space between list items
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)' // Added subtle shadow to list items
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '18px', color: '#333' }}>{q?.name || 'N/A'}</strong> {/* Handle missing name safely */}
                    <span style={{ color: '#666', marginLeft: '10px', fontSize: '14px' }}>({q?.email || 'N/A'})</span> {/* Handle missing email safely */}
                  </div>
                  <div style={{ margin: '10px 0', fontStyle: 'italic', borderLeft: '4px solid #ccc', paddingLeft: '10px', color: '#555' }}>
                    {q?.message || 'No message content'} {/* Handle missing message safely */}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ color: '#777' }}>Status: </span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px', // Slightly smaller status text
                        backgroundColor: q?.status === 'Resolved' ? '#d4edda' : '#fff3cd', // Lighter background colors, Handle missing status safely
                        color: q?.status === 'Resolved' ? '#155724' : '#856404' // Darker text colors for contrast, Handle missing status safely
                      }}
                    >
                      {q?.status || 'Pending'} {/* Default status safely */}
                    </span>
                  </div>
                  {/* Check if automatedResponse exists and is not empty safely */}
                  {q?.automatedResponse && typeof q.automatedResponse === 'string' && q.automatedResponse.trim() !== '' && (
                    <div style={{
                      marginTop: '10px',
                      backgroundColor: '#e9ecef', // Light gray background
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      borderLeft: '4px solid #007bff', // Blue border for response
                      color: '#333'
                    }}>
                      <strong>Automated Response:</strong>
                      <p style={{ margin: '5px 0 0', color: '#555' }}>{q.automatedResponse}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {/* Render Pagination Controls if there are queries and more than one page */}
          {totalQueries > queriesPerPage && renderPaginationControls()}
        </>
      )}
    </div>
  );
};

export default ClientQueryPage;
