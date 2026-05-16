import Recipes from "./subcomponents/Recipes"
import HeroSection from "./subcomponents/HeroSection"
import ProteinTracker from "./ProteinTracker"

function Home({recipes}) {
  return (
    <>
    <HeroSection recipes={recipes}/>
    <Recipes recipes={recipes}/>
    <ProteinTracker />
    </>
  )
}

export default Home
