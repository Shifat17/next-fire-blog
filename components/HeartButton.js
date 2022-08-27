import { firestore, auth } from '@lib/firebase';
import { increment, collection, writeBatch, doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

export default function HeartButton({ postRef }) {
  const heartRef = doc(postRef, 'hearts', auth.currentUser.uid);
  const [snapshot, loading, error] = useDocument(heartRef);

  const addHeart = async () => {
    // Get a new write batch
    const uid = auth.currentUser.uid;
    const batch = writeBatch(firestore);
    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });
    // Commit the batch
    await batch.commit();
  };

  const removeHeart = async () => {
    const batch = writeBatch(firestore);
    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);
    await batch.commit();
  };

  return (
    <>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Document: Loading...</span>}
      {snapshot?.exists() ? (
        <button onClick={removeHeart}>💔 Unheart</button>
      ) : (
        <button onClick={addHeart}>💗 Heart</button>
      )}
    </>
  );
}
