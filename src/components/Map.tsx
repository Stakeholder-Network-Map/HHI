import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { DB, Incident, MarkerFilters } from 'types'
import SearchControl from 'components/controls/SearchControl'
import IncidentPanel from 'components/controls/IncidentPanel'
import ZoomControl from 'components/controls/ZoomControl'
import IncidentLayer from './layers/IncidentLayer'
import { LatLngBoundsLiteral } from 'leaflet'
import CategoryControl from './controls/CategoryControl'
import YearControl from './controls/YearControl'
import CountryControl from './controls/CountryControl'
import Control from 'react-leaflet-custom-control'

interface MapProps {
  apiKey: string
  data: DB
  isAdmin: boolean
  addIncident: (incident: Incident) => Promise<boolean>
  deleteIncident: (incidentID: keyof DB['Incidents']) => Promise<boolean>
  editIncident: (incidentID: keyof DB['Incidents'], incident: Incident) => Promise<boolean>
}

function SetInitialBounds() {
  const map = useMap()
  useEffect(() => {
    map.setView([0, -70], 5) // Centered on South America. If changing this, make sure to adjust the reset button in ZoomControl.tsx
  }, [])
  return null
}

const Map: React.FC<MapProps> = ({ apiKey, data, isAdmin, addIncident, deleteIncident, editIncident }) => {
  const maxBounds: LatLngBoundsLiteral = [
    // Southwest coordinate
    [-90, -180],
    // Northeast coordinate
    [90, 180],
  ]
  const [selectedIncidentID, setSelectedIncidentID] = useState<keyof DB['Incidents'] | null>(null)
  const [filters, setFilters] = useState<MarkerFilters>({
    hideCategories: [],
    hideTypes: [],
    startYear: null,
    endYear: null,
    hideCountries: [],
    hideDepartments: [],
    hideMunicipalities: [],
  })
  const [tmpSelected, setTmpSelected] = useState<boolean>(false)
  const markersLayer = useRef(null)
  const [location, setLocation] = useState<Incident['location'] | null>(null)
  const [editID, setEditID] = useState<keyof DB['Incidents'] | null>(null)

  async function submitIncident(
    dateString: Incident['dateString'],
    typeID: Incident['typeID'],
    description: Incident['description'],
    country: Incident['country'],
    department: Incident['department'],
    municipality: Incident['municipality'],
    incidentID: keyof DB['Incidents'] | null
  ): Promise<boolean> {
    if (!dateString) {
      alert('Please enter a date for the incident')
      return false
    }

    if (!Object.keys(data.Types).some((id) => id == typeID)) {
      alert('Tipo de evento no válido, algo salió mal')
      return false
    }

    if (!location) {
      alert('Por favor, selecciona una lugar en el mapa')
      return false
    }
    if (incidentID != null) {
      if (!(await editIncident(incidentID, { description, dateString, typeID, location, country, department, municipality }))) {
        alert('No se pudo editar el incidente')
        return false
      }
      alert('Incidente editado con éxito')
    } else {
      if (!(await addIncident({ description, dateString, typeID, location, country, department, municipality }))) {
        alert('No se pudo crear el incidente')
        return false
      }
      alert('Incidente creado con éxito')
    }
    return true
  }

  async function deleteSelectedIncident() {
    if (!selectedIncidentID || confirm('¿Estás seguro de que quieres eliminar este incidente?') == false) {
      return
    }
    if (await deleteIncident(selectedIncidentID)) {
      setSelectedIncidentID(null)
      alert('Incidente eliminado con éxito')
    } else {
      alert('No se pudo eliminar el incidente')
    }
  }

  function onClose() {
    setSelectedIncidentID(null)
    setTmpSelected(false)
    setLocation(null)
  }

  return (
    <>
      <MapContainer
        className="h-full w-full"
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18} // We can adjust this later depending on how detailed the data is.
        scrollWheelZoom={true}
        zoomControl={false}
        maxBounds={maxBounds}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=${apiKey}`}
        />
        <IncidentLayer
          data={data}
          selectedIncidentID={selectedIncidentID}
          setSelectedIncidentID={setSelectedIncidentID}
          ref={markersLayer}
          isAdmin={isAdmin}
          tmpLocation={location}
          setTmpLocation={setLocation}
          tmpSelected={tmpSelected}
          filters={filters}
          editID={editID}
        />
        <IncidentPanel
          data={data}
          incidentID={selectedIncidentID}
          onClose={onClose}
          submitIncident={submitIncident}
          location={location}
          setLocation={setLocation}
          tmpSelected={tmpSelected}
          setTmpSelected={setTmpSelected}
          isAdmin={isAdmin}
          deleteSelectedIncident={deleteSelectedIncident}
          setEditID={setEditID}
          editID={editID}
        />
        <Control prepend position="topleft">
          <div className="leaflet-bar">
            <CategoryControl data={data} filters={filters} setFilters={setFilters} />
            <CountryControl data={data} filters={filters} setFilters={setFilters} />
          </div>
        </Control>
        <Control position="bottomleft">
          <YearControl data={data} filters={filters} setFilters={setFilters} />
          <SearchControl />
        </Control>
        <ZoomControl zoomLevel={2} setFilters={setFilters} />
        <SetInitialBounds />
      </MapContainer>
      {isAdmin && (
        <div className="absolute bottom-0 right-0 z-[1000]">
          <button
            className="mb-6 mr-20 rounded-md bg-green-dark p-2 text-white hover:bg-green"
            onClick={() => {
              setSelectedIncidentID(null)
              setTmpSelected(true)
            }}
          >
            Crear incidente
          </button>
        </div>
      )}
    </>
  )
}

export default Map
