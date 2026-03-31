import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';
import Bt_Logo from '../../../assets/Bt_Logo.svg?react';
import Bt_instargram from '../../../assets/Bt_instargram.svg?react';
import Bt_linkedin from '../../../assets/Bt_linkedin.svg?react';
import Bt_twitter_x from '../../../assets/Bt_twitter-x.svg?react';
import Bt_kakaotalk from '../../../assets/Bt_kakaotalk.svg?react';

const Footer = () => {
    return (
        <footer id="footer">
            <div className="inner">
                <div className="footer-top">
                    <div className="slogan">
                        <span>
                            Scented,
                            <br />
                            special in
                            <br />
                            <span className="point-text">everyday</span> life
                        </span>
                    </div>

                    <div className="links-group">
                        <div className="bttext">
                            <span className="title">Orders &amp; Support</span>
                            <div className="btlinks">
                                <span className="text"><Link to="/support/contact">Contact Us</Link></span>
                                <span className="text"><Link to="/support/faq">FAQ</Link></span>
                                <span className="text"><Link to="/support/faq">Shipping</Link></span>
                                <span className="text"><Link to="/support/faq">Returns</Link></span>
                                <span className="text"><Link to="/support">Terms &amp; Conditions</Link></span>
                            </div>
                        </div>

                        <div className="bttext">
                            <span className="title">Services</span>
                            <div className="btlinks">
                                <span className="text"><a href="#">Aesop Foundation</a></span>
                                <span className="text"><a href="#">Careers</a></span>
                                <span className="text"><a href="#">Privacy Policy</a></span>
                                <span className="text"><a href="#">Product Authenticity</a></span>
                                <span className="text"><a href="#">Cookie Policy</a></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="btlogo" aria-hidden="true">
                    <span>
                        <Bt_Logo width="100%" height="auto" fill="currentColor" aria-label="Aesop" />
                    </span>
                </div>

                <div className="footer-bottom">
                    <div className="bttext info-text">
                        <span className="copy">{'\u00A9 Aesop'}</span>
                        <div className="info-lines">
                            <span className="text">Business Registration No. 220-81-73483</span>
                            <span className="text">E-commerce Registration No. 2012-Seoul Gangnam-01663</span>
                            <span className="text">L{'\u2019'}Or{'\u00E9'}al Korea LLC | Representative: REBELO PIZARRO RODRIGO ALVARO</span>
                        </div>
                    </div>

                    <div className="footer-bottom-right">
                        <div className="sns">
                            <a href="#" aria-label="Instagram">
                                <Bt_instargram width="30" height="30" />
                            </a>
                            <a href="#" aria-label="X (Twitter)">
                                <Bt_twitter_x width="30" height="30" />
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <Bt_linkedin width="30" height="30" />
                            </a>
                            <a href="#" aria-label="KakaoTalk">
                                <Bt_kakaotalk width="30" height="30" />
                            </a>
                        </div>

                        <div className="btservice">
                            <span className="text"><a href="#">Terms of Use</a></span>
                            <span className="text"><a href="#">Sitemap</a></span>
                            <span className="text"><a href="#">Privacy Policy</a></span>
                            <span className="text"><a href="#">Cookie Settings</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
