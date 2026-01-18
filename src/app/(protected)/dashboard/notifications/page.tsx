'use client';

import { useState } from 'react';
import { sendNotification } from '@/actions/notification-actions';

export default function SendNotificationForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      title: form.title.value,
      body: form.body.value,
      link: form.link.value,
    };

    const res = await sendNotification(data);
    setLoading(false);

    alert(
      res.success
        ? `Sent: ${res.successCount}, Failed: ${res.failureCount}`
        : res.error
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input name="title" placeholder="Title" className="input" required />
      <textarea name="body" placeholder="Message" className="input" required />
      <input name="link" placeholder="Click URL (optional)" className="input" />
      <button disabled={loading} className="btn">
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
    </form>
  );
}
