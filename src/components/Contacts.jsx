import React from 'react'
import { Link } from 'react-router-dom'


function Contacts() {
    return (
        <div>
            <section className="py-16 bg-white text-center">
                <h2 className="text-3xl font-semibold mb-4">Жардам керекпи? Биз менен байланышыңыз</h2>
                <p className="text-xl max-w-lg mx-auto mb-10">Биздин колдоо командасы 24/7 сиздин суроолоруңузга жооп берет.</p>
                <Link to="/contact" className="inline-block bg-[#0DB297] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#0ca88d] transition">Биз менен байланышыныз</Link>
            </section>
        </div>
    )
}

export default Contacts
