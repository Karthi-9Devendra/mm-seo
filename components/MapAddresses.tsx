import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Fix Leaflet marker icon issue in Next.js/React Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface Address {
  firstLineAddress: string;
  cityName: string;
  stateName: string;
  postalCodeNew: string;
  addressType: string;
  telephoneNumber: string;
  faxNumber: string;
}

interface MapAddressesProps {
  addresses: Address[];
}

export default function MapAddresses({ addresses }: MapAddressesProps) {
  const [coords, setCoords] = useState<any[]>([]);

  useEffect(() => {
    async function geocodeAll() {
      const results = await Promise.all(addresses.map(async (address) => {
        const query = encodeURIComponent(`${address.firstLineAddress}, ${address.cityName}, ${address.stateName} ${address.postalCodeNew}`);
        const url = `https://photon.komoot.io/api/?q=${query}&limit=1`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.features && data.features[0]) {
            return {
              lat: data.features[0].geometry.coordinates[1],
              lng: data.features[0].geometry.coordinates[0],
              label: address.addressType,
              address,
            };
          }
        } catch {}
        return null;
      }));
      setCoords(results.filter(Boolean));
    }
    geocodeAll();
  }, [addresses]);

  if (coords.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center border">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  const center:any = [coords[0].lat, coords[0].lng];
  return (
    <div className="aspect-[4/3] rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} className='z-[0]'>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords.map((c, i) => (
          <Marker key={i} position={[c.lat, c.lng]}>
            <Popup>
              <strong>{c.label} Address</strong><br />
              {c.address.firstLineAddress}<br />
              {c.address.cityName}, {c.address.stateName} {c.address.postalCodeNew}<br />
              Phone: {c.address.telephoneNumber}
              {c.address.faxNumber && (<><br />Fax: {c.address.faxNumber}</>)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
