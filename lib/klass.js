require('./text.js');

const repo = (name, path) => `package ${path};

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ${name.capitalize()}Repository extends JpaRepository<${name.capitalize()}, Long> {

}
`;

const entity = (name, path) => `package ${path};

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.io.Serializable;

@Entity
public class ${name.capitalize()} implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    public ${name.capitalize()}() {
        super();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
`;

const ctrl = (name, path) => `package ${path};

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/${name}")
public class ${name.capitalize()}Controller {

    @Autowired
    ${name.capitalize()}Repository repo;

    @GetMapping
    public List<${name.capitalize()}> list() {
        return repo.findAll();
    }

    @PostMapping
    public void add(@RequestBody ${name.capitalize()} ${name}) {
        repo.save(${name});
    }
}
`;

const prop = () => `spring.datasource.url=jdbc:mysql://localhost:3306/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.jpa.database-platxeform=org.hibernate.dialect.MySQLDialect`;

const swaggerPom = (version = '2.7.0') => [
    {
        "groupId": {
            "_text": "io.springfox"
        },
        "artifactId": {
            "_text": "springfox-swagger2"
        },
        "version": {
            "_text": version
        }
    },
    {
        "groupId": {
            "_text": "io.springfox"
        },
        "artifactId": {
            "_text": "springfox-swagger-ui"
        },
        "version": {
            "_text": version
        }
    }
];

const swaggerConfig = (path) => `package ${path};

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfig {
    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }
}
`;
module.exports = { ctrl, entity, repo, prop, swaggerPom, swaggerConfig }