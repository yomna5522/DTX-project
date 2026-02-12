const STORAGE_KEY = "dtx_contact_submissions";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
}

function load(): ContactSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(submissions: ContactSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export const contactApi = {
  submit(data: { name: string; email: string; phone: string; message: string }): { success: true; id: string } {
    const submissions = load();
    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString(),
    };
    submissions.push(submission);
    save(submissions);
    return { success: true, id: submission.id };
  },
};
