import axios from 'axios';
import { Form, Formik } from 'formik';
import { ArrowLeft, CheckCircle, MessageSquare, Send, X, XCircle } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import * as Yup from 'yup';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Textarea } from '../components/ui/textarea.jsx';

const ContactSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  message: Yup.string().required('Message is required'),
});

// Simple Toast component
function Toast({ message, type, onClose }) {
  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-full">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] ${
          isSuccess
            ? 'bg-green-900/90 border border-green-700 text-green-100'
            : 'bg-red-900/90 border border-red-700 text-red-100'
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        )}
        <p className="flex-1 text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Contact() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <>
      <Head>
        <title>Contact & Feedback | The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="Get in touch with The Trick Book team. Share your feedback, report issues, or suggest new features."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/contact" />
      </Head>

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
              <MessageSquare className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Contact & Feedback</h1>
            <p className="text-muted-foreground text-lg">
              We'd love to hear from you! Share your thoughts, report bugs, or suggest features.
            </p>
          </div>

          {/* Toast Notification */}
          {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          )}

          {/* Contact Form */}
          <div className="bg-card rounded-lg p-6">
            <Formik
              initialValues={{ name: '', email: '', message: '' }}
              validationSchema={ContactSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  setSubmitting(true);
                  await axios.post('https://api.thetrickbook.com/api/contact/send-email', {
                    name: values.name,
                    email: values.email,
                    message: values.message,
                  });
                  showToast("Message sent successfully! We'll get back to you soon.", 'success');
                  resetForm();
                } catch (_error) {
                  showToast('Failed to send message. Please try again.', 'error');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors, touched, values, handleChange, handleBlur }) => (
                <Form className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.name && errors.name ? 'border-red-500' : ''}
                    />
                    {touched.name && errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.email && errors.email ? 'border-red-500' : ''}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us what's on your mind - feedback, bug reports, feature ideas..."
                      rows={5}
                      value={values.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.message && errors.message ? 'border-red-500' : ''}
                    />
                    {touched.message && errors.message && (
                      <p className="text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                    <Link href="/">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              You can also reach us directly at{' '}
              <a href="mailto:admin@thetrickbook.com" className="text-yellow-500 hover:underline">
                admin@thetrickbook.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
