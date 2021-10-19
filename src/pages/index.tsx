import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ posts }) {
  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        <img src="/Logo.svg" alt="Logo" />
        {posts.map(post => (
          <a href="">
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div>
              <span>{post.first_publication_date}</span>
              <span>{post.data.author}</span>
            </div>
          </a>
        ))}
        
        <button type="button">Carregar mais posts</button>
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5,
  });

  const posts = postsResponse.results.map(post => {
    return{
      slug: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle, 
        author: post.data.author
      }
    }
  })

  return {
    props:{
      posts
    }
  }
};
