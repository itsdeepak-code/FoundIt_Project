// Client-side checks give instant feedback. The server validates everything again.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function validateItemForm(values) {
  const errors = {};
  if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
  if (values.description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
  if (!values.type) errors.type = 'Choose lost or found.';
  if (!values.category) errors.category = 'Choose a category.';
  if (values.location.trim().length < 2) errors.location = 'Location is required.';
  if (!values.incidentDate) errors.incidentDate = 'Date is required.';
  return errors;
}

export function validateClaimForm({ ownershipReason, identifyingDetails }) {
  const errors = {};
  if (ownershipReason.trim().length < 10) {
    errors.ownershipReason = 'Please explain in at least 10 characters.';
  }
  if (identifyingDetails.trim().length < 5) {
    errors.identifyingDetails = 'Please give at least one identifying detail (5+ characters).';
  }
  return errors;
}
