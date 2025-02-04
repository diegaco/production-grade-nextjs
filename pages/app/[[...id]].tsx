import React, { FC, useState } from 'react'
import { useSession, getSession } from 'next-auth/client'
import { Pane, Dialog, majorScale } from 'evergreen-ui'
import { useRouter } from 'next/router'
import Logo from '../../components/logo'
import FolderList from '../../components/folderList'
import NewFolderButton from '../../components/newFolderButton'
import User from '../../components/user'
import FolderPane from '../../components/folderPane'
import DocPane from '../../components/docPane'
import NewFolderDialog from '../../components/newFolderDialog'
import { folder, doc, connectToDB } from '../../db';

const App: FC<{ folders?: any[]; activeFolder?: any; activeDoc?: any; activeDocs?: any[] }> = ({
  folders,
  activeDoc,
  activeFolder,
  activeDocs,
}) => {
  const router = useRouter()
  const [newFolderIsShown, setIsShown] = useState(false)
  const [session, loading] = useSession();
  const [allFolders, setAllFolders] = useState(folders || []);

  const handleNewFolder = async (name:string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/folder`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { data } = await res.json();
    setAllFolders(state => [...state, data]);
  }

  if (loading) return null;

  const Page = () => {
    if (activeDoc) {
      return <DocPane folder={activeFolder} doc={activeDoc} />
    }

    if (activeFolder) {
      return <FolderPane folder={activeFolder} docs={activeDocs} />
    }

    return null
  }

  if (!loading && !session) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    )
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={allFolders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page />
      </Pane>
      <NewFolderDialog close={() => setIsShown(false)} isShown={newFolderIsShown} onNewFolder={handleNewFolder} />
    </Pane>
  )
}

export async function getServerSideProps(context) {
  // DONT recommend to call your own api here
  // there is no need to go outside in the internet and reach back the api
  // the api logic should go here, db stuff.

  const session = await getSession(context);
  // not signed in
  if (!session || !session.user) return { props: {} }

  const props: any = { session };
  const { db } = await connectToDB();
  const folders = await folder.getFolders(db, session.user.id);
  props.folders = folders;

  if (context.params.id) {
    const activeFolder = folders.find((f) => f._id === context.params.id[0]);
    const activeDocs = await doc.getDocsByFolder(db, activeFolder._id);
    props.activeFolder = activeFolder;
    props.activeDocs = activeDocs;

    const activeDocId = context.params.id[1];

    if (activeDocId) {
      props.activeDoc = await doc.getOneDoc(db, activeDocId);
    }
  }

  return {
    props,
  }
}

/**
 * Catch all handler. Must handle all different page
 * states.
 * 1. Folders - none selected /app root app, must show all folders
 * 2. Folders => Folder selected /app/[id] must show selected folder
 * 3. Folders => Folder selected => Document selected /app/1/2 show docs from folder
 *
 * These design decition was made because the layout is the same for three pages.
 *  It could be a Layout component and three separate routes too.
 *
 * An unauth user should not be able to access this page.
 *
 * @param context
 */
export default App
