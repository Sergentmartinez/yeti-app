export interface GPXPoint {
    lat: number
    lon: number
    ele: number
  }
  
  export function parseGPX(xml: string): GPXPoint[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
  
    const pts = Array.from(doc.getElementsByTagName('trkpt'))
  
    return pts.map(pt => ({
      lat: parseFloat(pt.getAttribute('lat') || '0'),
      lon: parseFloat(pt.getAttribute('lon') || '0'),
      ele: parseFloat(pt.getElementsByTagName('ele')[0]?.textContent || '0'),
    }))
  }
  