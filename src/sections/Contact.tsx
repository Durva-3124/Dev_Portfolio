import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiGithub, FiLinkedin } from 'react-icons/fi';
import { contact } from '@/data';

interface Errors { name?: string; email?: string; message?: string; }

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
    const body = encodeURIComponent(form.message);
    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setErrors(er => ({ ...er, [key]: undefined }));
    }
  });

  return (
    <section id="contact" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent-tint uppercase tracking-widest text-sm mb-2">{contact.subheading}</p>
          <h2 className="text-4xl font-heading font-bold text-white">{contact.heading}</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div>
              <input
                type="text"
                placeholder="Your name"
                {...field('name')}
                className="w-full px-4 py-3 bg-surface/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-tint transition-colors"
              />
              {errors.name && <p className="text-accent-tint text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email"
                {...field('email')}
                className="w-full px-4 py-3 bg-surface/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-tint transition-colors"
              />
              {errors.email && <p className="text-accent-tint text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <textarea
                rows={5}
                placeholder="Your message"
                {...field('message')}
                className="w-full px-4 py-3 bg-surface/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-tint transition-colors resize-none"
              />
              {errors.message && <p className="text-accent-tint text-xs mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-accent hover:bg-accent-tint text-white font-semibold rounded-lg transition-colors"
            >
              Send Message
            </button>
          </motion.form>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 flex flex-col justify-center"
          >
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-white/70 hover:text-accent-tint transition-colors">
              <FiMail size={20} /> {contact.email}
            </a>
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-accent-tint transition-colors">
              <FiLinkedin size={20} /> LinkedIn
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-accent-tint transition-colors">
              <FiGithub size={20} /> GitHub
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
