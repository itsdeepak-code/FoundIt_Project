import { MapPinOff } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        icon={MapPinOff}
        title="This page went missing"
        message="Ironic, we know. The page you're looking for doesn't exist."
        action={<Button to="/">Back to home</Button>}
      />
    </div>
  );
}
