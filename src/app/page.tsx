import { Experience } from '@/components/Experience';

/**
 * MORPHIN — the entire cinematic journey is mounted here.
 *
 * This page is intentionally a thin shell: the heavy lifting (3D, timeline,
 * smooth scroll) lives in the client component tree so the server sends almost
 * nothing.
 */
export default function Page() {
  return <Experience />;
}