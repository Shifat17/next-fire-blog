import styles from '@styles/Admin.module.css';
import AuthCheck from '@components/AuthCheck';
import PostFeed from '@components/PostFeed';
import { UserContext } from '@lib/context';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '@lib/firebase';
import Loader from '@components/Loader';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  getDoc,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function AdminPostsPage(props) {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const { user } = useContext(UserContext);
  const userId = user.uid;
  const postsRef = collection(firestore, 'users', userId, 'posts');

  const [value, loading, error] = useCollection(postsRef, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const posts =
    value &&
    value.docs.map((doc) => {
      return { ...doc.data() };
    });
  // getDocs(postsRef).then((snapshot) => {
  //   console.log(snapshot);
  //   snapshot.docs.forEach((doc) => {
  //     return posts.push({ ...doc.data() });
  //   });
  // });

  console.log(posts);

  return (
    <>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Collection: Loading...</span>}
      <h1>Manage Your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { user, username } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const uid = user.uid;

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e) => {
    e.preventDefault();
    const ref = doc(firestore, 'users', uid, 'posts', slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(ref, data);
    toast.success('Post Created');
    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}
