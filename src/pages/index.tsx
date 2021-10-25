import { GetStaticProps } from 'next';
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from "react-icons/fi";

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

export default function Home(props:HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [nextPage, setnextPage] = useState('')

  useEffect(() => {
      setPosts(props.postsPagination.results)
      setnextPage(props.postsPagination.next_page)
  }, [])

  function searchMoreData(url){
    fetch(url)
        .then(response => response.json())
            .then(data => {
              setnextPage(data.next_page)
              for (let i = 0; i < data.results.length; i++) {
                setPosts([...posts, {uid: data.results[i].uid,
                  first_publication_date: new Date(data.results[i].first_publication_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }),
                  data: {
                    author: data.results[i].data.author,
                    subtitle: data.results[i].data.subtitle,
                    title: data.results[i].data.title
                  }}]);
            
              }
            })
  }

  let button
  if(nextPage){
    button = <button type="button" onClick={() => searchMoreData(props.postsPagination.next_page)}>Carregar mais posts</button>
  } 

  return (
    <main className={commonStyles.container}>
      <div className={styles.posts}>
        <img src="/Logo.svg" alt="logo" />
        {posts.map(result => (
          <Link href={`post/${result.uid}`} key={result.uid}>
            <a>
              <strong>{result.data.title}</strong>
              <p>{result.data.subtitle}</p>
              <div>
                <span><FiCalendar /> {result.first_publication_date}</span>
                <span><FiUser /> {result.data.author}</span>
              </div>
            </a>
          </Link>
        ))}

        {nextPage ? <button type="button" onClick={() => searchMoreData(nextPage)}>Carregar mais posts</button> : ''}
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

  const next_page = postsResponse.next_page
  const results = postsResponse.results.map(post => {
    return{
      uid: post.uid,
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
      postsPagination:{
        results,
        next_page
      }
    }
  }
};
