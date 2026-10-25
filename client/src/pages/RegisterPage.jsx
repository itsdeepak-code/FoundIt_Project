import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { getErrorInfo } from '../api/client.js';
import AuthCard from '../components/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import FormField, { inputClass } from '../components/ui/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateRegisterForm } from '../utils/validation.js';

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Asha Verma' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@college.edu' },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
    hint: 'At least 8 characters, with a letter and a number.',
  },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
];

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const clientErrors = validateRegisterForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { name, email, password } = values;
      const result = await register({ name, email, password });
      toast.success(result.message);
    } catch (error) {
      const info = getErrorInfo(error);
      setFormError(info.message);
      setErrors(info.errors);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join FoundIt to report and recover items on campus."
      error={formError}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {FIELDS.map((field) => (
          <FormField key={field.name} label={field.label} htmlFor={field.name} error={errors[field.name]} hint={field.hint}>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              className={inputClass(errors[field.name])}
              value={values[field.name]}
              onChange={handleChange}
            />
          </FormField>
        ))}
        <Button type="submit" className="w-full" loading={submitting} icon={UserPlus}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
