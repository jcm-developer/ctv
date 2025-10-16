import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('home') // 'home' | 'lists'
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState(null)
  const [showCreateList, setShowCreateList] = useState(false)
  const [showAddToList, setShowAddToList] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [sortOrder, setSortOrder] = useState('default') // 'default' | 'rating-desc' | 'rating-asc'
  const [showDetails, setShowDetails] = useState(false)
  const [movieDetails, setMovieDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showActorMovies, setShowActorMovies] = useState(false)
  const [selectedActor, setSelectedActor] = useState(null)
  const [actorMovies, setActorMovies] = useState([])
  const [actorSearchTerm, setActorSearchTerm] = useState('')
  const [loadingActorMovies, setLoadingActorMovies] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL
  const TOKEN = import.meta.env.VITE_TOKEN

  // Verificar sesión al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('myFilmsUser')
    if (savedUser) {
      setCurrentUser(savedUser)
    }
  }, [])

  // Cargar listas del usuario actual
  useEffect(() => {
    if (currentUser) {
      const savedLists = localStorage.getItem(`myFilmsLists_${currentUser}`)
      if (savedLists) {
        setLists(JSON.parse(savedLists))
      } else {
        setLists([])
      }
    }
  }, [currentUser])

  // Guardar listas en localStorage del usuario actual
  useEffect(() => {
    if (currentUser && lists.length >= 0) {
      localStorage.setItem(`myFilmsLists_${currentUser}`, JSON.stringify(lists))
    }
  }, [lists, currentUser])

  // Cargar películas populares al inicio
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/movie/popular?language=es-ES&page=1`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        setMovies(data.results)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching movies:', error)
        setLoading(false)
      }
    }

    if (currentView === 'home' && searchTerm === '') {
      fetchPopularMovies()
    }
  }, [currentView])

  // Búsqueda en la API con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (searchTerm.trim() === '') {
      // Si no hay búsqueda, cargar populares
      const fetchPopularMovies = async () => {
        try {
          setLoading(true)
          const response = await fetch(`${API_URL}/movie/popular?language=es-ES&page=1`, {
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
          setMovies(data.results)
          setLoading(false)
        } catch (error) {
          console.error('Error:', error)
          setLoading(false)
        }
      }
      if (currentView === 'home') {
        fetchPopularMovies()
      }
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${API_URL}/search/multi?query=${encodeURIComponent(searchTerm)}&language=es-ES&page=1`,
          {
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        )
        const data = await response.json()
        setMovies(data.results.filter(item => item.poster_path))
        setLoading(false)
      } catch (error) {
        console.error('Error searching:', error)
        setLoading(false)
      }
    }, 500)

    setSearchTimeout(timeout)

    return () => clearTimeout(timeout)
  }, [searchTerm, currentView])

  const getImageUrl = (path) => {
    return `https://image.tmdb.org/t/p/w500${path}`
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const createList = (name) => {
    const newList = {
      id: Date.now(),
      name: name,
      items: [],
      createdAt: new Date().toISOString()
    }
    setLists([...lists, newList])
    setShowCreateList(false)
  }

  const deleteList = (listId) => {
    setLists(lists.filter(list => list.id !== listId))
    if (selectedList?.id === listId) {
      setSelectedList(null)
    }
  }

  const addToList = (listId, item) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        // Evitar duplicados
        if (list.items.some(i => i.id === item.id)) {
          return list
        }
        return {
          ...list,
          items: [...list.items, item]
        }
      }
      return list
    }))
    setShowAddToList(false)
    setSelectedMovie(null)
  }

  const removeFromList = (listId, itemId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId)
        }
      }
      return list
    })

    setLists(updatedLists)

    // Actualizar selectedList si es la lista actual
    if (selectedList?.id === listId) {
      const updatedList = updatedLists.find(list => list.id === listId)
      setSelectedList(updatedList)
    }
  }

  const getMediaTitle = (item) => {
    return item.title || item.name || 'Sin título'
  }

  const getMediaType = (item) => {
    if (item.media_type === 'tv') return 'Serie'
    if (item.media_type === 'movie') return 'Película'
    return 'Media'
  }

  const getSortedItems = (items) => {
    if (!items || items.length === 0) return []

    const sortedItems = [...items]

    switch (sortOrder) {
      case 'rating-desc':
        return sortedItems.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      case 'rating-asc':
        return sortedItems.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0))
      default:
        return sortedItems
    }
  }

  const fetchMovieDetails = async (item) => {
    try {
      setLoadingDetails(true)
      setShowDetails(true)

      const mediaType = item.media_type === 'tv' ? 'tv' : 'movie'
      const endpoint = `${API_URL}/${mediaType}/${item.id}?language=es-ES&append_to_response=credits,videos`

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setMovieDetails({ ...data, media_type: item.media_type })
      setLoadingDetails(false)
    } catch (error) {
      console.error('Error fetching details:', error)
      setLoadingDetails(false)
    }
  }

  const closeDetails = () => {
    setShowDetails(false)
    setMovieDetails(null)
  }

  const getDetailTitle = (details) => {
    return details.title || details.name || 'Sin título'
  }

  const getReleaseYear = (details) => {
    const date = details.release_date || details.first_air_date
    return date ? new Date(date).getFullYear() : 'N/A'
  }

  const getRuntime = (details) => {
    if (details.runtime) {
      const hours = Math.floor(details.runtime / 60)
      const minutes = details.runtime % 60
      return `${hours}h ${minutes}min`
    }
    if (details.episode_run_time && details.episode_run_time[0]) {
      return `${details.episode_run_time[0]}min por episodio`
    }
    return 'N/A'
  }

  const fetchActorMovies = async (actor) => {
    try {
      setLoadingActorMovies(true)
      setShowActorMovies(true)
      setSelectedActor(actor)
      setShowDetails(false)

      const response = await fetch(
        `${API_URL}/person/${actor.id}/combined_credits?language=es-ES`,
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()
      const allCredits = [...(data.cast || []), ...(data.crew || [])]

      // Eliminar duplicados y filtrar los que tienen poster
      const uniqueMovies = allCredits
        .filter((item, index, self) =>
          item.poster_path &&
          index === self.findIndex(t => t.id === item.id)
        )
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

      setActorMovies(uniqueMovies)
      setLoadingActorMovies(false)
    } catch (error) {
      console.error('Error fetching actor movies:', error)
      setLoadingActorMovies(false)
    }
  }

  const closeActorMovies = () => {
    setShowActorMovies(false)
    setSelectedActor(null)
    setActorMovies([])
    setActorSearchTerm('')
  }

  const getFilteredActorMovies = () => {
    if (!actorSearchTerm.trim()) return actorMovies

    return actorMovies.filter(item =>
      getMediaTitle(item).toLowerCase().includes(actorSearchTerm.toLowerCase())
    )
  }

  const handleLogin = (username) => {
    setCurrentUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem('myFilmsUser')
    setCurrentUser(null)
    setLists([])
    setCurrentView('home')
    setSelectedList(null)
  }

  // Si no hay usuario logueado, mostrar login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>
            Cortés TV+
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <button
            className={`nav-button ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <span className="material-symbols-rounded">home</span>
            Inicio
          </button>
          <button
            className={`nav-button ${currentView === 'lists' ? 'active' : ''}`}
            onClick={() => setCurrentView('lists')}
          >
            <span className="material-symbols-rounded">lists</span>
            Mis Listas
          </button>
          <div className="nav-user">
            <span className="user-name">{currentUser}</span>
            <button className="logout-button" onClick={handleLogout} title="Cerrar sesión">
              <span className="material-symbols-rounded">logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-rounded">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="user-name">{currentUser}</span>
        </div>

        <div className="mobile-menu-links">
          <button
            className={`mobile-nav-button ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('home')
              setMobileMenuOpen(false)
            }}
          >
            <span className="material-symbols-rounded">home</span>
            Inicio
          </button>

          <button
            className={`mobile-nav-button ${currentView === 'lists' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('lists')
              setMobileMenuOpen(false)
            }}
          >
            <span className="material-symbols-rounded">lists</span>
            Mis Listas
          </button>

          <button
            className="mobile-nav-button logout"
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
          >
            <span className="material-symbols-rounded">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {currentView === 'home' && (
        <div className="home-view">
          <header className="header">
            <p>Descubre películas, series y documentales</p>

            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar en toda la base de datos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>
          </header>

          {loading ? (
            <div className="loading-inline">
              <div className="spinner"></div>
              <p>Buscando...</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron resultados para "{searchTerm}"</p>
            </div>
          ) : (
            <div className="movies-grid">
              {movies.map((item) => (
                <div key={item.id} className="movie-card" onClick={() => fetchMovieDetails(item)}>
                  <div className="movie-poster">
                    <img
                      src={getImageUrl(item.poster_path)}
                      alt={getMediaTitle(item)}
                      loading="lazy"
                    />
                    <button
                      className="add-to-list-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMovie(item)
                        setShowAddToList(true)
                      }}
                      title="Añadir a lista"
                    >
                      <span className="material-symbols-rounded">add</span>
                    </button>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{getMediaTitle(item)}</h3>
                    <div className="movie-rating">
                      <div>
                        <span className="star">
                          <span className="material-symbols-rounded">star</span>
                        </span>
                        <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <span className="media-type">{getMediaType(item)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'lists' && (
        <div className="lists-view">
          <div className="lists-header">
            <h2>
              Mis Listas
            </h2>
            <button
              className="create-list-btn"
              onClick={() => setShowCreateList(true)}
            >
              <span className="material-symbols-rounded">add</span>
              Crear Lista
            </button>
          </div>

          {!selectedList ? (
            <div className="lists-grid">
              {lists.length === 0 ? (
                <div className="empty-state">
                  <p>No tienes listas creadas</p>
                  <p className="hint">Crea una lista para organizar tus películas favoritas</p>
                </div>
              ) : (
                lists.map(list => {
                  const lastItem = list.items[list.items.length - 1]
                  const posterPath = lastItem?.poster_path || lastItem?.backdrop_path

                  return (
                    <div
                      key={list.id}
                      className="list-card"
                      onClick={() => setSelectedList(list)}
                    >
                      <div className="list-card-poster">
                        {posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                            alt={list.name}
                          />
                        ) : (
                          <div className="list-card-placeholder">
                            <span className="material-symbols-rounded">movie</span>
                          </div>
                        )}
                        <div className="list-card-gradient"></div>
                        <div className="list-card-content">
                          <h3>{list.name}</h3>
                          <p className="list-count">
                            <span className="material-symbols-rounded">movie</span>
                            {list.items.length} {list.items.length === 1 ? 'elemento' : 'elementos'}
                          </p>
                        </div>
                      </div>
                      <button
                        className="list-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteList(list.id)
                        }}
                        title="Eliminar lista"
                      >
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            <div className="list-detail">
              <div className="list-detail-header">
                <button
                  className="back-btn"
                  onClick={() => {
                    setSelectedList(null)
                    setSortOrder('default')
                  }}
                >
                  <span className="material-symbols-rounded">arrow_back</span>
                  Volver
                </button>
                <h2>{selectedList.name}</h2>
                <span className="list-count">{selectedList.items.length} elementos</span>
              </div>

              {selectedList.items.length === 0 ? (
                <div className="empty-state">
                  <p>Esta lista está vacía</p>
                  <p className="hint">Ve a Inicio y añade películas o series a esta lista</p>
                </div>
              ) : (
                <>
                  <div className="sort-controls">
                    <label>Ordenar por:</label>
                    <div className="sort-buttons">
                      <button
                        className={`sort-btn ${sortOrder === 'default' ? 'active' : ''}`}
                        onClick={() => setSortOrder('default')}
                      >
                        <span className="material-symbols-rounded">calendar_month</span>
                        Orden de añadido
                      </button>
                      <button
                        className={`sort-btn ${sortOrder === 'rating-desc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('rating-desc')}
                      >
                        <span className="material-symbols-rounded">star</span>
                        Mayor valoración
                      </button>
                      <button
                        className={`sort-btn ${sortOrder === 'rating-asc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('rating-asc')}
                      >
                        <span className="material-symbols-rounded">trending_down</span>
                        Menor valoración
                      </button>
                    </div>
                  </div>

                  <div className="movies-grid">
                    {getSortedItems(selectedList.items).map((item) => (
                      <div key={item.id} className="movie-card" onClick={() => fetchMovieDetails(item)}>
                        <div className="movie-poster">
                          <img
                            src={getImageUrl(item.poster_path)}
                            alt={getMediaTitle(item)}
                            loading="lazy"
                          />
                          <button
                            className="remove-from-list-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromList(selectedList.id, item.id)
                            }}
                            title="Quitar de la lista"
                          >
                            <span className="material-symbols-rounded">close</span>
                          </button>
                        </div>
                        <div className="movie-info">
                          <h3 className="movie-title">{getMediaTitle(item)}</h3>
                          <div className="movie-rating">
                            <div>
                              <span className="star">
                                <span className="material-symbols-rounded">star</span>
                              </span>
                              <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span className="media-type">{getMediaType(item)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Lista */}
      {showCreateList && (
        <div className="modal-overlay" onClick={() => setShowCreateList(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Crear Nueva Lista</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const name = e.target.listName.value.trim()
              if (name) {
                createList(name)
                e.target.reset()
              }
            }}>
              <input
                type="text"
                name="listName"
                placeholder="Nombre de la lista"
                className="modal-input"
                autoFocus
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Crear
                </button>
                <button type="button" onClick={() => setShowCreateList(false)} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Añadir a Lista */}
      {showAddToList && selectedMovie && (
        <div className="modal-overlay" onClick={() => setShowAddToList(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Añadir a Lista</h2>
            <p className="modal-subtitle">Selecciona una lista para "{getMediaTitle(selectedMovie)}"</p>

            {lists.length === 0 ? (
              <div className="empty-state">
                <p>No tienes listas creadas</p>
              </div>
            ) : (
              <div className="lists-selection">
                {lists.map(list => (
                  <button
                    key={list.id}
                    className="list-option"
                    onClick={() => addToList(list.id, selectedMovie)}
                  >
                    <span>{list.name}</span>
                    <span className="list-count-badge">{list.items.length}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              {lists.length === 0 && (
                <button
                  onClick={() => {
                    setShowAddToList(false)
                    setCurrentView('lists')
                    setShowCreateList(true)
                  }}
                  className="submit-btn"
                >
                  Crear Lista
                </button>
              )}
              <button onClick={() => setShowAddToList(false)} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetails && (
        <div className="modal-overlay details-overlay" onClick={closeDetails}>
          <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            {loadingDetails ? (
              <div className="loading-inline">
                <div className="spinner"></div>
                <p>Cargando detalles...</p>
              </div>
            ) : movieDetails ? (
              <div className="details-content">
                <button className="close-details-btn" onClick={closeDetails}>
                  <span className="material-symbols-rounded">close</span>
                </button>

                <div className="details-header">
                  {movieDetails.backdrop_path && (
                    <div className="details-backdrop">
                      <img
                        src={`https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`}
                        alt={getDetailTitle(movieDetails)}
                      />
                      <div className="backdrop-gradient"></div>
                    </div>
                  )}

                  <div className="details-title-section">
                    <h2>{getDetailTitle(movieDetails)}</h2>
                    <div className="details-meta">
                      <span className="meta-item">{getReleaseYear(movieDetails)}</span>
                      <span className="meta-separator">•</span>
                      <span className="meta-item">{getRuntime(movieDetails)}</span>
                      <span className="meta-separator">•</span>
                      <span className="meta-item rating-badge">
                        <span className="material-symbols-rounded">star</span>
                        {movieDetails.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-body">
                  {movieDetails.genres && movieDetails.genres.length > 0 && (
                    <div className="details-section">
                      <h3>Géneros</h3>
                      <div className="genres-list">
                        {movieDetails.genres.map(genre => (
                          <span key={genre.id} className="genre-tag">{genre.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {movieDetails.overview && (
                    <div className="details-section">
                      <h3>Sinopsis</h3>
                      <p className="overview">{movieDetails.overview}</p>
                    </div>
                  )}

                  {movieDetails.credits?.cast && movieDetails.credits.cast.length > 0 && (
                    <div className="details-section">
                      <h3>Reparto Principal</h3>
                      <div className="cast-list">
                        {movieDetails.credits.cast.slice(0, 8).map(actor => (
                          <div
                            key={actor.id}
                            className="cast-member"
                            onClick={() => fetchActorMovies(actor)}
                          >
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                alt={actor.name}
                              />
                            ) : (
                              <div className="cast-placeholder">
                                <span className="material-symbols-rounded">person</span>
                              </div>
                            )}
                            <p className="actor-name">{actor.name}</p>
                            <p className="character-name">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {movieDetails.number_of_seasons && (
                    <div className="details-section">
                      <h3>Información de la Serie</h3>
                      <p>
                        <strong>Temporadas:</strong> {movieDetails.number_of_seasons} |
                        <strong> Episodios:</strong> {movieDetails.number_of_episodes}
                      </p>
                      {movieDetails.status && (
                        <p><strong>Estado:</strong> {movieDetails.status}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="details-actions">
                  <button
                    className="add-to-list-action-btn"
                    onClick={() => {
                      setSelectedMovie(movieDetails)
                      setShowAddToList(true)
                      setShowDetails(false)
                    }}
                  >
                    <span className="material-symbols-rounded">add</span>
                    Añadir a lista
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal Películas del Actor */}
      {showActorMovies && (
        <div className="modal-overlay details-overlay" onClick={closeActorMovies}>
          <div className="modal details-modal actor-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-details-btn" onClick={closeActorMovies}>
              <span className="material-symbols-rounded">close</span>
            </button>

            {loadingActorMovies ? (
              <div className="loading-inline">
                <div className="spinner"></div>
                <p>Cargando filmografía...</p>
              </div>
            ) : selectedActor ? (
              <div className="actor-movies-content">
                <div className="actor-movies-header">
                  {selectedActor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${selectedActor.profile_path}`}
                      alt={selectedActor.name}
                      className="actor-header-image"
                    />
                  ) : (
                    <div className="actor-header-placeholder">
                      <span className="material-symbols-rounded">person</span>
                    </div>
                  )}
                  <div className="actor-header-info">
                    <h2>{selectedActor.name}</h2>
                    <p className="actor-credits-count">
                      {actorMovies.length} {actorMovies.length === 1 ? 'crédito' : 'créditos'}
                    </p>
                  </div>
                </div>

                <div className="actor-search-container">
                  <input
                    type="text"
                    placeholder="Buscar en la filmografía..."
                    value={actorSearchTerm}
                    onChange={(e) => setActorSearchTerm(e.target.value)}
                    className="actor-search-input"
                  />
                </div>

                {getFilteredActorMovies().length === 0 ? (
                  <div className="no-results">
                    <p>No se encontraron resultados para "{actorSearchTerm}"</p>
                  </div>
                ) : (
                  <div className="movies-grid actor-movies-grid">
                    {getFilteredActorMovies().map((item) => (
                      <div
                        key={`${item.id}-${item.media_type}`}
                        className="movie-card"
                        onClick={() => {
                          closeActorMovies()
                          fetchMovieDetails(item)
                        }}
                      >
                        <div className="movie-poster">
                          <img
                            src={getImageUrl(item.poster_path)}
                            alt={getMediaTitle(item)}
                            loading="lazy"
                          />
                          <button
                            className="add-to-list-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMovie(item)
                              setShowAddToList(true)
                            }}
                            title="Añadir a lista"
                          >
                            <span className="material-symbols-rounded">add</span>
                          </button>
                        </div>
                        <div className="movie-info">
                          <h3 className="movie-title">{getMediaTitle(item)}</h3>
                          <div className="movie-rating">
                            <div>
                              <span className="star">
                                <span className="material-symbols-rounded">star</span>
                              </span>
                              <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span className="media-type">{getMediaType(item)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
