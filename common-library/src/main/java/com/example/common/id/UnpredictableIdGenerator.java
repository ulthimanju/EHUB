package com.example.common.id;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

public class UnpredictableIdGenerator implements IdentifierGenerator {

    private static final SnowflakeIdGenerator generator = new SnowflakeIdGenerator(1);

    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) {
        return generator.nextId();
    }
}
