import { getUserWithUsername } from './index';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import {
  collection,
  collectionGroup,
  query,
  where,
  doc,
  getDocs,
} from 'firebase/firestore';
import { firestore, postsToJson } from '../../lib/firebase';
import styles from '@styles/Post.module.css';
import PostContent from '../../components/PostContent';
import AuthCheck from '@components/AuthCheck';
import HeartButton from '@components/HeartButton';
import Link from 'next/link';

export async function getPostsBySlug(slug, userDoc) {
  let posts = [];
  console.log(userDoc);
  const userRef = doc(firestore, 'users', userDoc.id);
  const postsRef = collection(userRef, 'posts');
  const q = query(postsRef, where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const post = postsToJson({ ...doc.data(), id: doc.id });
    return posts.push(post);
  });
  console.log(posts);
  return posts[0];
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const user = await getUserWithUsername(username);
  let post;
  if (user) {
    post = await getPostsBySlug(slug, user);
  }

  return {
    props: {
      userId: user.id,
      post,
      postId: post.id,
    },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  let posts = [];
  const postsRef = collectionGroup(firestore, 'posts');
  const q = query(postsRef, where('published', '==', true));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    return posts.push({ ...doc.data() });
  });

  const paths = posts.map((post) => {
    const { slug, username } = post;
    return {
      params: {
        username,
        slug,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
}

export default function Post(props) {
  const postRef = doc(firestore, 'users', props.userId, 'posts', props.postId);
  const [value, loading, error] = useDocumentData(postRef);
  const post = value || props.post;

  return (
    <main className={styles.container}>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Document: Loading...</span>}
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>
        <AuthCheck
          fallback={
            <Link href="/enter" passHref>
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
