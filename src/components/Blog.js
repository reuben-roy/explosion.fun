import Navbar from '../components/Navbar';
import Head from 'next/head';

export default function Blog() {
    return (
        <div>
            <Head>
                <title>Blog - Resume Project</title>
            </Head>
            <Navbar />
            <main style={{ paddingTop: '60px' }}>
                <h1>Blog</h1>
                {/* Your blog content here */}
            </main>
        </div>
    );
}