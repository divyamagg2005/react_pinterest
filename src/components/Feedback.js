import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Feedback.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    visitPurpose: '',
    taskCompletion: '',
    satisfaction: '',
    feedbackComment: '',
    userEmail: '',
    contactConsent: false
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!formData.satisfaction) {
      setError('Please select your satisfaction level.');
      return false;
    }
    if (!formData.feedbackComment.trim()) {
      setError('Please enter your suggestions for improvement.');
      return false;
    }
    if (!formData.userEmail.trim()) {
      setError('Please enter your email.');
      return false;
    }
    if (!validateEmail(formData.userEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      await emailjs.send(
        "service_ID",
        "template_ID",
        {
          satisfaction: formData.satisfaction,
          feedbackComment: formData.feedbackComment,
          userEmail: formData.userEmail,
          contactConsent: formData.contactConsent ? "Yes" : "No",
          visitPurpose: formData.visitPurpose,
          taskCompletion: formData.taskCompletion
        },
        "INIT_ID"
      );

      setShowThankYou(true);
      setFormData({
        visitPurpose: '',
        taskCompletion: '',
        satisfaction: '',
        feedbackComment: '',
        userEmail: '',
        contactConsent: false
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      setError('Failed to send feedback. Please try again later.');
    }
  };

  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} Pinterest, Inc.</p>
      <p>Terms | Privacy | Interest-based ads</p>
      <div className="feedback-container">
        <h3>We'd Love Your Feedback</h3>
        {!showThankYou ? (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="visitPurpose">What brought you to our site today?</label>
              <select
                id="visitPurpose"
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select a reason</option>
                <option value="browsing">Just browsing for inspiration</option>
                <option value="searching">Looking for specific images</option>
                <option value="creating">Working on a creative project</option>
                <option value="learning">Learning about photography/design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Did you find what you were looking for?</label>
              <div className="radio-group">
                {['yes', 'partially', 'no'].map((value) => (
                  <label key={value} className="radio-label">
                    <input
                      type="radio"
                      name="taskCompletion"
                      value={value}
                      checked={formData.taskCompletion === value}
                      onChange={handleInputChange}
                      required
                    />
                    <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>How satisfied are you with your experience?</label>
              <div className="rating">
                {[5, 4, 3, 2, 1].map((value) => (
                  <React.Fragment key={value}>
                    <input
                      type="radio"
                      id={`star${value}`}
                      name="satisfaction"
                      value={value}
                      checked={formData.satisfaction === value.toString()}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor={`star${value}`} title={value === 5 ? 'Excellent' : value === 4 ? 'Good' : value === 3 ? 'Average' : value === 2 ? 'Poor' : 'Terrible'}>★</label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feedbackComment">Any suggestions for improvement?</label>
              <textarea
                id="feedbackComment"
                name="feedbackComment"
                rows="3"
                placeholder="Share your thoughts..."
                value={formData.feedbackComment}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="userEmail">Email</label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                placeholder="Your email for follow-up"
                value={formData.userEmail}
                onChange={handleInputChange}
              />
              <div className="consent-checkbox">
                <input
                  type="checkbox"
                  id="contactConsent"
                  name="contactConsent"
                  checked={formData.contactConsent}
                  onChange={handleInputChange}
                />
                <label htmlFor="contactConsent">It's okay to contact me about my feedback</label>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="submit-button">Submit Feedback</button>
          </form>
        ) : (
          <div className="thank-you-message">
            <h4>Thank You!</h4>
            <p>Your feedback helps us improve our website.</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Feedback; 
