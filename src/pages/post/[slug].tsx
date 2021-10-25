import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';

import { FiWatch, FiCalendar, FiUser } from "react-icons/fi";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }:PostProps) {
  const [tempoLeitura, setTempoLeitura] = useState(0)
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  useEffect(() => {
    let WordsCount = 0
    post.data.content.map(palavras => {
      WordsCount += palavras.heading.split(' ').length
      palavras.body.map(palavrasCorpo => {
        WordsCount += palavrasCorpo.text.split(' ').length
      })
    })

    timeToReadCalc(WordsCount)
  }, [])

  function timeToReadCalc(WordsQuantity){
    let resultTime
    resultTime = Math.round(WordsQuantity / 200)
    setTempoLeitura(resultTime)
  }

  return(
    <>
      <div className={commonStyles.container}>
        <Header />
      </div>

      <img src={post.data.banner.url} alt="banner" className={styles.banner}/>

      <div className={commonStyles.container}>
        <div className={styles.postContent}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfos}>
            <span><FiCalendar /> {post.first_publication_date}</span>
            <span><FiUser /> {post.data.author}</span>
            <span><FiWatch /> {tempoLeitura} min</span>
          </div>

          <div className={styles.postText}>
            {
              post.data.content.map(palavras => {
                return(
                  <div key={palavras.heading}>
                    <h1>{palavras.heading}</h1>
                    <p>{palavras.body[0].text}</p>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths = async () => {
  return {
    paths: [
      { params: {
        slug: 'utilizando-hooks'
      }}
    ],
    fallback: true
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug, {});

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    }
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30, //30 minutos
  }
};

