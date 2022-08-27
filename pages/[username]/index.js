import PostFeed from '../../components/PostFeed';
import UserProfile from '../../components/UserProfile';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  doc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { firestore, postsToJson } from '../../lib/firebase';

export async function getUserWithUsername(username) {
  let userDocs = [];
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapShot = await getDocs(q);
  querySnapShot.forEach((doc) => {
    return userDocs.push({ ...doc.data(), id: doc.id });
  });
  return userDocs[0];
}

export async function getPostsByUser(userDoc) {
  let posts = [];
  const userRef = doc(firestore, 'users', userDoc.id);
  const postsRef = collection(userRef, 'posts');
  const q = query(
    postsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const post = postsToJson({ ...doc.data() });
    return posts.push(post);
  });
  console.log(posts);
  return posts;
}

export async function getServerSideProps({ query }) {
  const { username } = query;
  console.log(username);
  const userDoc = await getUserWithUsername(username);

  // JSON serializable data
  let user = null;
  let posts = null;

  if (!userDoc) {
    return {
      notFound: true,
    };
  }
  if (userDoc) {
    user = userDoc;
    posts = await getPostsByUser(userDoc);
  }

  console.log(user);

  return {
    props: {
      user,
      posts,
    },
  };
}

export default function UserProfilePage({ user, posts }) {
  console.log(user);
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
      {/* <p>Hello from the user page</p> */}
    </main>
  );
}
