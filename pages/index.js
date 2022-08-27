import Loader from '../components/Loader';
import PostFeed from '../components/PostFeed';
import { firestore, postsToJson } from '../lib/firebase';
import { useState } from 'react';

import {
  collectionGroup,
  where,
  query,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  Timestamp,
  startAfter,
} from 'firebase/firestore';

// max post to query per page
const LIMIT = 1;

const getnewPosts = async (querySnap) => {
  let newPosts = [];
  querySnap.forEach((doc) => {
    return newPosts.push({ ...doc.data() });
  });
  return newPosts;
};

export async function getServerSideProps(context) {
  let posts = [];
  const postsRef = collectionGroup(firestore, 'posts');
  const q = query(
    postsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const post = postsToJson({ ...doc.data() });
    return posts.push(post);
  });

  return {
    props: {
      posts,
    },
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const fromMillis = Timestamp.fromMillis;

  const getMorePosts = async () => {
    setLoading(true);

    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;

    const q = query(
      collectionGroup(firestore, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT)
    );
    const querySnapshot = await getDocs(q);
    const newPosts = await getnewPosts(querySnapshot);
    console.log(newPosts);
    setPosts(posts.concat(newPosts));
    setLoading(false);
    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <PostFeed posts={posts} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}
      <Loader show={loading} />
      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
