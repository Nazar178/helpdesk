import React, { Component } from 'react';
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
      isAdmin: false 
    };
  }

  componentDidMount() {
    this.loadUserInfo();
  }

  async loadUserInfo() {
    try {
      const response = await fetch('/api/account/me');
      if (!response.ok) {
        return;
      }

      const data = await response.json();

      
      const isAdmin =
        Array.isArray(data.roles) &&
        data.roles.includes('Admin');

      this.setState({
        isAdmin: isAdmin
      });
    } catch (e) {
      console.error('Cannot load user info', e);
      
    }
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <header>
        <Navbar
          className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3"
          container
          light
        >
          <NavbarBrand tag={Link} to="/">HelpDesk</NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          <Collapse
            className="d-sm-inline-flex flex-sm-row-reverse"
            isOpen={!this.state.collapsed}
            navbar
          >
            <ul className="navbar-nav flex-grow">
              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/">Główny</NavLink>
              </NavItem>

              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/tickets">Zgłoszenia</NavLink>
              </NavItem>

              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/reports">Raporty</NavLink>
              </NavItem>

            
              {this.state.isAdmin && (
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/admin">
                    Panel admina
                  </NavLink>
                </NavItem>
              )}

              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/profile">
                  Profil
                </NavLink>
              </NavItem>

            
              <NavItem>
                <NavLink className="text-dark" href="/Identity/Account/Manage">
                  Account
                </NavLink>
              </NavItem>
            </ul>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}
