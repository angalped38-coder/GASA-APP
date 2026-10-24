import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        message: '¡Gran trabajo Familia Galindo Salomon! Cada cuota cancelada en Guaraníes y cada meta alcanzada en GASA objetivos fortalece la armonía y la tranquilidad familiar. ¡Sigan con este excelente ritmo!',
        tips: [
          'Revisar los gastos semanales en familia fortalece el trabajo en equipo de GASA.',
          'Mantener al día las cuotas y servicios (ANDE, ESSAP) evita recargos y mantiene la paz mental.',
          'Celebrar cada avance en las metas de ahorro mantiene alta la motivación de la Familia Galindo Salomon.'
        ],
        quote: 'Un hogar unido como la Familia Galindo Salomon construye su prosperidad paso a paso.'
      });
    }

    const { summary, goals, pendingPayments, members } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Eres "GASA Coach", el asesor financiero personal y motivador de la Familia Galindo Salomon (GASA objetivos) en Paraguay.
La divisa utilizada es Guaraníes Paraguayos (₲ / PYG).
Tu tono es cálido, empático, altamente motivacional, cariñoso y práctico para una familia paraguaya comprometida.

Analiza la siguiente situación financiera mensual del hogar de la Familia Galindo Salomon y genera:
1) Un mensaje motivacional inspirador y positivo destacando el trabajo en equipo de la Familia Galindo Salomon y felicitándolos por sus avances (máximo 3 párrafos cortos).
2) 3 recomendaciones prácticas y concretas para el mes en Guaraníes.
3) Una frase positiva corta para el día de la Familia Galindo Salomon.

Datos del Hogar GASA:
- Miembros: ${JSON.stringify(members?.map((m: any) => ({ name: m.name, role: m.role })) || [])}
- Resumen mensual en Guaraníes: Ingresos ₲ ${summary?.totalIncome || 0}, Gastos ₲ ${summary?.totalExpenses || 0}, Balance Neto ₲ ${summary?.netBalance || 0}, Tasa de ahorro: ${summary?.savingsRate || 0}%.
- Pagos pendientes o cuotas: ${summary?.pendingPaymentsCount || 0} pendientes (₲ ${summary?.pendingPaymentsAmount || 0} total, ${summary?.urgentPaymentsCount || 0} urgentes).
- Metas de ahorro GASA: ${JSON.stringify(goals?.map((g: any) => ({ title: g.title, current: g.currentAmount, target: g.targetAmount })) || [])}

Responde en formato JSON estrictamente válido con los campos:
{
  "message": "texto del mensaje motivacional mencionando a la Familia Galindo Salomon o equipo GASA",
  "tips": ["consejo 1", "consejo 2", "consejo 3"],
  "quote": "frase corta positiva para la familia"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        message: text || '¡Excelente trabajo en GASA objetivos para la Familia Galindo Salomon! Sigan construyendo su bienestar financiero juntos.',
        tips: [
          'Prioricen liquidar las cuotas más próximas a vencer para evitar intereses.',
          'Destinen un aporte fijo a sus metas de ahorro antes de gastos discrecionales.',
          'Compartan los logros con la familia para mantener el entusiasmo colectivo.'
        ],
        quote: 'La perseverancia de la Familia Galindo Salomon es la llave de todos sus objetivos.'
      });
    }
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return NextResponse.json({
      fallback: true,
      message: '¡Cada guaraní bien administrado por la Familia Galindo Salomon es una victoria para el hogar GASA! Mantengan la constancia.',
      tips: [
        'Revisen los vencimientos de la semana en familia.',
        'Anoten cada gasto diario para no perder de vista el presupuesto en Guaraníes.',
        'Festejen cuando alcancen cada hito de sus metas familiares.'
      ],
      quote: 'El secreto del ahorro de la Familia Galindo Salomon es priorizar juntos con amor.'
    });
  }
}
