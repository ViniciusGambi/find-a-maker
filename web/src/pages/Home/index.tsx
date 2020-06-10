import React from 'react';
import './styles.css';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import logo from '../../assets/logo.svg'

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Find a Maker"/> 
                </header>

                <main>
                    <h1>Seu marketplace maker</h1>
                    <p>Te ajudamos a encontrar um maker perto de você!</p>
                
                    <Link to="/create-point">
                        <span>
                            <FiLogIn />
                        </span>
                        <strong>Cadastre um ponto maker</strong>
                    </Link>
                </main>                
            </div>
        </div>

    )
}

export default Home;