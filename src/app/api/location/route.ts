import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórias.' },
        { status: 400 }
      );
    }

    // zoom=16 = nível de bairro (mais preciso que zoom=14)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=pt-BR`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MktPlaceFeiraCasa/1.0 (contato@feira.casa)',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim retornou ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Bairro: prioridade para suburb > neighbourhood > city_district > quarter
    const neighborhood =
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.quarter ||
      null;

    // Cidade
    let city =
      address.city ||
      address.town ||
      address.municipality ||
      address.county ||
      'Cidade desconhecida';

    // Estado abreviado (ex: DF, SP, RJ)
    const stateFullName = address.state || '';
    const stateAbbr =
      address['ISO3166-2-lvl4']?.split('-')[1] ||
      (stateFullName === 'Distrito Federal' ? 'DF' : stateFullName.slice(0, 2).toUpperCase()) ||
      '';

    // Especial para DF: se a cidade for Brasília, promovemos o bairro/RA para "Cidade"
    if (stateAbbr === 'DF' && city === 'Brasília' && neighborhood) {
      // Remove sufixos comuns que atrapalham (ex: Taguatinga Centro -> Taguatinga)
      city = address.town || neighborhood.split(' ')[0] === 'Setor' ? neighborhood : neighborhood;
    }

    // Label completo para salvar: "Nova Iguaçu - RJ" ou "Taguatinga - DF"
    const formattedAddress = `${city} - ${stateAbbr}`;

    return NextResponse.json({
      success: true,
      address: formattedAddress,
      shortLabel: neighborhood || city,
      details: {
        neighborhood,
        city,
        state: stateAbbr,
        stateFullName,
        suburb: address.suburb,
        road: address.road,
        postcode: address.postcode,
        displayName: data.display_name,
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[Location API] Erro:', msg);
    return NextResponse.json(
      { error: 'Erro ao converter coordenadas em endereço.' },
      { status: 500 }
    );
  }
}