import Link from 'next/link'

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return(
    <Link href="/">  
      <img src="/Logo.svg" alt="logo" className={styles.link}/>
    </Link>
  )
}
