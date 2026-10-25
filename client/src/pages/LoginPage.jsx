import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { getErrorInfo } from '../api/client.js';
import AuthCard from '../components/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import FormField, { inputClass } from '../components/ui/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateLoginForm } from '../utils/validation.js';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
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
    const clientErrors = validateLoginForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      // On success GuestRoute redirects to the page the user wanted, or the dashboard.
      const result = await login(values);
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
      title="Welcome back"
      subtitle={location.state?.from ? 'Log in to continue.' : 'Log in to report and claim items.'}
      error={formError}
      footer={
        <>
          New to FoundIt?{' '}
          <Link to="/register" state={location.state} className="font-medium text-indigo-600 hover:text-indigo-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass(errors.email)}
            value={values.email}
            onChange={handleChange}
            placeholder="you@college.edu"
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputClass(errors.password)}
            value={values.password}
            onChange={handleChange}
          />
        </FormField>
        <Button type="submit" className="w-full" loading={submitting} icon={LogIn}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
