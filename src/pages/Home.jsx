import Header from '../components/Header'
import Hero from '../components/Hero'
import ToolsGrid from '../components/ToolsGrid'
import Features from '../components/Features'
import Footer from '../components/Footer'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <Header />
      <Hero />
      <ToolsGrid />
      <Features />
      <Footer />
    </div>
  )
}

export default Home
