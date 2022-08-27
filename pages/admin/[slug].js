import styles from '@styles/Admin.module.css';
import AuthCheck from '@components/AuthCheck';
import { firestore, auth } from '@lib/firebase';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from '@components/ImageUploader';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';
export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;
  const userId = auth.currentUser.uid;

  const postRef = doc(firestore, 'users', userId, 'posts', slug);
  const [value, loading, error] = useDocumentDataOnce(postRef);
  value && console.log(value);

  return (
    <main className={styles.container}>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Document: Loading...</span>}
      {value && (
        <>
          <section>
            <h1>{value.title}</h1>
            <p>ID: {value.slug}</p>
            <PostForm
              postRef={postRef}
              defaultValues={value}
              preview={preview}
            />
          </section>
          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${value.username}/${value.slug}`} passHref>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
    // <main>
    //   <p>Hello from the post</p>
    // </main>
  );
}

function PostForm({ postRef, defaultValues, preview }) {
  const { register, errors, handleSubmit, formState, reset, watch } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });
    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register('content', {
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        <fieldset>
          <input
            className={styles.checkbox}
            {...register('published')}
            type="checkbox"
          />
          <label>Published</label>
        </fieldset>
        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
