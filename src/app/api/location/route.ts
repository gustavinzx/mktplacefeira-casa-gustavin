import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude e longitude são obrigatórias.' }, { status: 400 });
    }

    // Geocodificação Reversa via Nominatim (OpenStreetMap)
    // O addressdetails=1 garante que a API separe o bairro, cidade, rua, etc.
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        // Obrigatório pelos Termos de Uso do Nominatim para não ser bloqueado
        'User-Agent': 'MktPlaceFeiraCasa/1.0 (FeiraCasaApp)'
      }
    });

    if (!response.ok) {
      throw new Error('Falha na comunicação com o Nominatim');
    }

    const data = await response.json();
    
    // Extraindo as partes do endereço com fallbacks
    const address = data.address || {};
    const bairro = address.suburb || address.neighbourhood || address.city_district || 'Bairro desconhecido';
    const cidade = address.city || address.town || address.village || address.municipality || 'Cidade desconhecida';
    const estado = address.state || '';

    // Formatação amigável (ex: Recanto das Emas, Brasília - Distrito Federal)
    const formattedAddress = `${bairro}, ${cidade} - ${estado}`;

    return NextResponse.json({ 
      success: true, 
      address: formattedAddress,
      details: address 
    });

  } catch (error: any) {
    console.error('Erro na geocodificação:', error);
    return NextResponse.json({ error: 'Erro ao converter coordenadas em endereço.' }, { status: 500 });
  }
}
